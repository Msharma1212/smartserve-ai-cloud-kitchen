export interface TrainStop {
  stationCode: string;
  stationName: string;
  arrivalTime: string;
  departureTime: string;
  distanceKm: number;
}

// Converts a cumulative list of 24h schedule stops into absolute linear minutes since departure
export const getLinearTimes = (stops: TrainStop[]) => {
  let baseDay = 0;
  let prevMins = -1;
  return stops.map((stop) => {
    const [arrH, arrM] = (stop.arrivalTime || "12:00").split(":").map(Number);
    const [depH, depM] = (stop.departureTime || "12:05").split(":").map(Number);
    
    const arrMins = (isNaN(arrH) ? 12 : arrH) * 60 + (isNaN(arrM) ? 0 : arrM);
    const depMins = (isNaN(depH) ? 12 : depH) * 60 + (isNaN(depM) ? 5 : depM);
    
    if (prevMins !== -1) {
      if (arrMins < prevMins) {
        // Crossed midnight during travel!
        baseDay += 1;
      }
    }
    const linearArr = baseDay * 1440 + arrMins;
    
    if (depMins < arrMins) {
      // Crossed midnight during the stop
      baseDay += 1;
    }
    const linearDep = baseDay * 1440 + depMins;
    
    prevMins = depMins;
    
    return {
      ...stop,
      linearArr,
      linearDep
    };
  });
};

// Returns whether a given station departure time has passed according to the simulated/actual current clock time.
export const isStationPassed = (departureTimeStr: string, currentSimulatedTime: string, stops?: TrainStop[], stopCode?: string): boolean => {
  if (!departureTimeStr) return false;

  // If we have stops and a stopCode, we can map to linear times to handle midnight crossings robustly!
  if (stops && stops.length > 0 && stopCode) {
    const linearStops = getLinearTimes(stops);
    const target = linearStops.find(s => s.stationCode === stopCode);
    if (target) {
      const liveInfo = getTrainPositionInfo(stops, currentSimulatedTime);
      return liveInfo.linearCurrentTime > target.linearDep;
    }
  }

  // Simple safe fallback
  const [currH, currM] = currentSimulatedTime.split(":").map(Number);
  const [depH, depM] = departureTimeStr.split(":").map(Number);
  if (isNaN(currH) || isNaN(currM) || isNaN(depH) || isNaN(depM)) return false;
  
  const currentMinutes = currH * 60 + currM;
  const departureMinutes = depH * 60 + depM;
  return currentMinutes > departureMinutes;
};

// Full positional analysis of the train along its sequence of stops
export const getTrainPositionInfo = (stops: TrainStop[], timeStr: string) => {
  if (!stops || stops.length === 0) {
    return {
      atStationIndex: -1,
      betweenStations: null,
      linearCurrentTime: 0,
      linearStops: []
    };
  }

  const linearStops = getLinearTimes(stops);
  const startLinear = linearStops[0].linearArr;
  const endLinear = linearStops[linearStops.length - 1].linearDep;

  const [h, m] = (timeStr || "21:38").split(":").map(Number);
  const dayMins = (isNaN(h) ? 21 : h) * 60 + (isNaN(m) ? 38 : m);

  // Find which day (0 or 1 or 2) best aligns with the trip sequence
  let bestLinearTime = dayMins;
  let minDistance = Infinity;

  for (let day = 0; day <= 2; day++) {
    const testLinear = day * 1440 + dayMins;
    if (testLinear >= startLinear && testLinear <= endLinear) {
      bestLinearTime = testLinear;
      break;
    }
    const dist = Math.min(Math.abs(testLinear - startLinear), Math.abs(testLinear - endLinear));
    if (dist < minDistance) {
      minDistance = dist;
      bestLinearTime = testLinear;
    }
  }

  const linearCurrentTime = bestLinearTime;

  // 1. Is the train currently AT a station stop?
  const atStationIndex = linearStops.findIndex(
    (s) => linearCurrentTime >= s.linearArr && linearCurrentTime <= s.linearDep
  );

  if (atStationIndex !== -1) {
    return {
      atStationIndex,
      betweenStations: null,
      linearCurrentTime,
      linearStops
    };
  }

  // 2. Is the train BETWEEN station stops?
  let departedIndex = -1;
  let approachingIndex = -1;

  for (let i = 0; i < linearStops.length - 1; i++) {
    const currentStopDef = linearStops[i];
    const nextStopDef = linearStops[i + 1];
    if (linearCurrentTime > currentStopDef.linearDep && linearCurrentTime < nextStopDef.linearArr) {
      departedIndex = i;
      approachingIndex = i + 1;
      break;
    }
  }

  if (departedIndex !== -1 && approachingIndex !== -1) {
    const depStop = linearStops[departedIndex];
    const arrStop = linearStops[approachingIndex];
    const totalSegment = arrStop.linearArr - depStop.linearDep;
    const elapsedSegment = linearCurrentTime - depStop.linearDep;
    const progressPct = totalSegment > 0 ? (elapsedSegment / totalSegment) * 100 : 50;

    return {
      atStationIndex: -1,
      betweenStations: {
        fromIndex: departedIndex,
        toIndex: approachingIndex,
        progressPct
      },
      linearCurrentTime,
      linearStops
    };
  }

  // If before first stop
  if (linearCurrentTime < startLinear) {
    return {
      atStationIndex: -1,
      betweenStations: {
        fromIndex: -1,
        toIndex: 0,
        progressPct: 0
      },
      linearCurrentTime,
      linearStops
    };
  }

  // If after last stop
  return {
    atStationIndex: -1,
    betweenStations: {
      fromIndex: linearStops.length - 1,
      toIndex: -1,
      progressPct: 100
    },
    linearCurrentTime,
    linearStops
  };
};

export const checkIsServiceable = (
  stop: { stationCode: string; stationName: string },
  franchises: any[] = []
): boolean => {
  const code = (stop.stationCode || "").toUpperCase();
  const name = (stop.stationName || "").toLowerCase();
  
  // High fidelity match against default active/supported kitchen branches
  const baseServiceableCodes = ["CNB", "NDLS", "DEL-CP", "KNP-JN", "PRYJ", "PNBE", "HWH", "DGR", "SDAH"];
  const isCodeMatch = baseServiceableCodes.some(c => code.includes(c));
  const isNameMatch = name.includes("kanpur") || name.includes("delhi") || name.includes("connaught") || name.includes("prayagraj") || name.includes("patna") || name.includes("howrah") || name.includes("durgapur") || name.includes("sealdah");
  
  const hasFranchise = franchises && franchises.some(f => {
    if (!f.isActive) return false;
    const fCode = f.code.toUpperCase();
    const fName = f.name.toLowerCase();
    return code === fCode || fCode.includes(code) || code.includes(fCode) || name.includes(fName) || fName.includes(name);
  });

  return isCodeMatch || isNameMatch || hasFranchise;
};

export const formatJourneyDate = (date: Date): string => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${String(date.getDate()).padStart(2, "0")}-${months[date.getMonth()]}-${date.getFullYear()}`;
};

export const formatTimeWithOffset = (baseDate: Date, offsetMinutes: number): string => {
  const targetDate = new Date(baseDate.getTime() + offsetMinutes * 60 * 1000);
  return `${String(targetDate.getHours()).padStart(2, "0")}:${String(targetDate.getMinutes()).padStart(2, "0")}`;
};

export const generateMockTrainForPnr = (pnr: string, baseTime?: Date): any => {
  const refTime = baseTime || new Date();
  
  // Deterministic train choice based on PNR character string sums
  let sum = 0;
  for (let i = 0; i < pnr.length; i++) {
    sum += pnr.charCodeAt(i);
  }
  const trainIdx = sum % 15;

  // Custom coaches depending on train types
  const coaches = ["A1", "A2", "B1", "B2", "B3", "B4", "C1", "C2", "E1", "E2", "H1", "S1", "S2", "S3"];
  const coach = coaches[sum % coaches.length];
  const seat = (sum % 72) + 1; // standard sleeper/AC chair berths are 1-72
  const currentDelayMins = sum % 5 === 0 ? (sum % 4) * 15 : 0; // occasional mock delays like 15m, 30m etc.

  const trainDefinitions = [
    {
      trainNo: "12301",
      trainName: "Howrah Rajdhani Express",
      stops: [
        { code: "NDLS", name: "New Delhi Railway Station", offset: -120, dist: 0 },
        { code: "CNB", name: "Kanpur Central (SmartServe Central Hub)", offset: -20, dist: 440 },
        { code: "PRYJ", name: "Prayagraj Junction", offset: 50, dist: 630 },
        { code: "PNBE", name: "Patna Junction Stop", offset: 160, dist: 980 },
        { code: "HWH", name: "Howrah Junction Terminus", offset: 270, dist: 1445 }
      ]
    },
    {
      trainNo: "12004",
      trainName: "New Delhi Lucknow Shatabdi Express",
      stops: [
        { code: "NDLS", name: "New Delhi Railway Station", offset: -160, dist: 0 },
        { code: "ALJN", name: "Aligarh Junction Hub", offset: -90, dist: 130 },
        { code: "TDL", name: "Tundla Junction", offset: -45, dist: 210 },
        { code: "CNB", name: "Kanpur Central (SmartServe Central Hub)", offset: 15, dist: 440 },
        { code: "LKO", name: "Lucknow Charbagh Terminus", offset: 90, dist: 512 }
      ]
    },
    {
      trainNo: "12259",
      trainName: "Sealdah Duronto Express",
      stops: [
        { code: "NDLS", name: "New Delhi Railway Station", offset: -220, dist: 0 },
        { code: "CNB", name: "Kanpur Central (SmartServe Central Hub)", offset: -50, dist: 440 },
        { code: "DGR", name: "Durgapur Hub stop", offset: 110, dist: 1280 },
        { code: "SDAH", name: "Sealdah Terminal Station", offset: 190, dist: 1450 }
      ]
    },
    {
      trainNo: "22436",
      trainName: "New Delhi Varanasi Vande Bharat Express",
      stops: [
        { code: "NDLS", name: "New Delhi Railway Station", offset: -100, dist: 0 },
        { code: "ALJN", name: "Aligarh Junction Hub", offset: -50, dist: 130 },
        { code: "CNB", name: "Kanpur Central (SmartServe Central Hub)", offset: 10, dist: 440 },
        { code: "PRYJ", name: "Prayagraj Junction stop", offset: 90, dist: 630 },
        { code: "BSB", name: "Varanasi Junction Terminus", offset: 150, dist: 755 }
      ]
    },
    {
      trainNo: "12649",
      trainName: "Karnataka Sampark Kranti Express",
      stops: [
        { code: "NZM", name: "Hazrat Nizamuddin Terminus", offset: -150, dist: 0 },
        { code: "JHS", name: "VHG Jhansi Junction", offset: -80, dist: 410 },
        { code: "CNB", name: "Kanpur Central (SmartServe Central Hub)", offset: -10, dist: 630 },
        { code: "PRYJ", name: "Prayagraj Junction", offset: 60, dist: 820 },
        { code: "MUV", name: "Manduadih Terminal", offset: 130, dist: 940 }
      ]
    },
    {
      trainNo: "12203",
      trainName: "Amritsar Garib Rath Express",
      stops: [
        { code: "ASR", name: "Amritsar Junction", offset: -220, dist: 0 },
        { code: "NDLS", name: "New Delhi Railway Station", offset: -100, dist: 448 },
        { code: "CNB", name: "Kanpur Central (SmartServe Central Hub)", offset: 20, dist: 888 },
        { code: "LKO", name: "Lucknow Charbagh stop", offset: 110, dist: 960 },
        { code: "GKP", name: "Gorakhpur Junction Station", offset: 200, dist: 1210 }
      ]
    },
    {
      trainNo: "22672",
      trainName: "Tejas Express High-Speed Special",
      stops: [
        { code: "NDLS", name: "New Delhi Railway Station", offset: -80, dist: 0 },
        { code: "TDL", name: "Tundla Junction", offset: -35, dist: 210 },
        { code: "CNB", name: "Kanpur Central (SmartServe Central Hub)", offset: 12, dist: 440 },
        { code: "LKO", name: "Lucknow Junction Terminus", offset: 75, dist: 512 }
      ]
    },
    {
      trainNo: "22353",
      trainName: "Patna Humsafar Express",
      stops: [
        { code: "ANVT", name: "Anand Vihar Terminus Delhi", offset: -110, dist: 0 },
        { code: "CNB", name: "Kanpur Central (SmartServe Central Hub)", offset: -15, dist: 428 },
        { code: "PRYJ", name: "Prayagraj Junction", offset: 45, dist: 618 },
        { code: "DDU", name: "Pt. DD Upadhyaya Junction", offset: 115, dist: 770 },
        { code: "PNBE", name: "Patna Junction Terminal", offset: 185, dist: 980 }
      ]
    },
    {
      trainNo: "12303",
      trainName: "Poorva Express Special",
      stops: [
        { code: "HWH", name: "Howrah Junction Terminus", offset: -240, dist: 0 },
        { code: "ASN", name: "Asansol Junction Hub", offset: -170, dist: 200 },
        { code: "PNBE", name: "Patna Junction Stop", offset: -90, dist: 545 },
        { code: "PRYJ", name: "Prayagraj Junction", offset: -12, dist: 855 },
        { code: "CNB", name: "Kanpur Central (SmartServe Central Hub)", offset: 45, dist: 1045 },
        { code: "NDLS", name: "New Delhi Railway Station", offset: 150, dist: 1485 }
      ]
    },
    {
      trainNo: "12419",
      trainName: "Gomti Express Daily Express",
      stops: [
        { code: "LKO", name: "Lucknow Charbagh Station", offset: -120, dist: 0 },
        { code: "ON", name: "Unnao Junction stop", offset: -60, dist: 55 },
        { code: "CNB", name: "Kanpur Central (SmartServe Central Hub)", offset: -5, dist: 72 },
        { code: "PHD", name: "Phaphund Station", offset: 45, dist: 155 },
        { code: "ETW", name: "Etawah Junction Station", offset: 90, dist: 211 },
        { code: "NDLS", name: "New Delhi Railway Station", offset: 180, dist: 512 }
      ]
    },
    {
      trainNo: "20801",
      trainName: "Magadh Superfast Mail",
      stops: [
        { code: "IPR", name: "Islampur Station", offset: -200, dist: 0 },
        { code: "PNBE", name: "Patna Junction Stop", offset: -120, dist: 64 },
        { code: "DDU", name: "Pt DD Upadhyaya Junction", offset: -40, dist: 275 },
        { code: "PRYJ", name: "Prayagraj Junction stop", offset: 30, dist: 425 },
        { code: "CNB", name: "Kanpur Central (SmartServe Central Hub)", offset: 110, dist: 615 },
        { code: "NDLS", name: "New Delhi Railway Station", offset: 220, dist: 1055 }
      ]
    },
    {
      trainNo: "15657",
      trainName: "Brahmaputra Mail Daily",
      stops: [
        { code: "KYQ", name: "Kamakhya Junction", offset: -280, dist: 0 },
        { code: "MLDT", name: "Malda Town Hub", offset: -190, dist: 350 },
        { code: "PNBE", name: "Patna Junction Stop", offset: -100, dist: 800 },
        { code: "PRYJ", name: "Prayagraj Junction", offset: -15, dist: 1150 },
        { code: "CNB", name: "Kanpur Central (SmartServe Central Hub)", offset: 65, dist: 1340 },
        { code: "NDLS", name: "New Delhi Railway Station", offset: 160, dist: 1780 }
      ]
    },
    {
      trainNo: "12505",
      trainName: "North East Express Special",
      stops: [
        { code: "KYQ", name: "Kamakhya Junction", offset: -240, dist: 0 },
        { code: "NJP", name: "New Jalpaiguri Hub", offset: -160, dist: 450 },
        { code: "PPTA", name: "Patliputra Junction Hub", offset: -80, dist: 900 },
        { code: "PRYJ", name: "Prayagraj Junction Stop", offset: 15, dist: 1250 },
        { code: "CNB", name: "Kanpur Central (SmartServe Central Hub)", offset: 95, dist: 1440 },
        { code: "ANVT", name: "Anand Vihar Terminus Delhi", offset: 180, dist: 1860 }
      ]
    },
    {
      trainNo: "12302",
      trainName: "Howrah Rajdhani Express (via Patna)",
      stops: [
        { code: "NDLS", name: "New Delhi Railway Station", offset: -120, dist: 0 },
        { code: "CNB", name: "Kanpur Central (SmartServe Central Hub)", offset: -20, dist: 440 },
        { code: "PRYJ", name: "Prayagraj Junction", offset: 40, dist: 630 },
        { code: "PNBE", name: "Patna Junction Stop", offset: 140, dist: 980 },
        { code: "HWH", name: "Howrah Junction Terminus", offset: 260, dist: 1445 }
      ]
    },
    {
      trainNo: "12309",
      trainName: "Patna Rajdhani Express Premium",
      stops: [
        { code: "RJPB", name: "Rajendra Nagar Terminal", offset: -150, dist: 0 },
        { code: "PNBE", name: "Patna Junction stop", offset: -130, dist: 4 },
        { code: "DDU", name: "Pt DD Upadhyaya Junction", offset: -50, dist: 215 },
        { code: "PRYJ", name: "Prayagraj Junction stop", offset: 15, dist: 365 },
        { code: "CNB", name: "Kanpur Central (SmartServe Central Hub)", offset: 90, dist: 555 },
        { code: "NDLS", name: "New Delhi Railway Station", offset: 185, dist: 995 }
      ]
    }
  ];

  const selectedDef = trainDefinitions[trainIdx];

  const routeStops = selectedDef.stops.map((st) => {
    // Each stop has departure time +5 mins from arrival time unless it is the terminus (terminus arrival equals departure)
    const arrStr = formatTimeWithOffset(refTime, st.offset);
    const depStr = formatTimeWithOffset(refTime, st.code === selectedDef.stops[selectedDef.stops.length - 1].code ? st.offset : st.offset + 5);
    return {
      stationCode: st.code,
      stationName: st.name,
      arrivalTime: arrStr,
      departureTime: depStr,
      distanceKm: st.dist
    };
  });

  // Decide current active station index by scanning linear offsets
  let currentStationIndex = 0;
  for (let i = 0; i < selectedDef.stops.length; i++) {
    if (selectedDef.stops[i].offset < 0) {
      currentStationIndex = i;
    }
  }

  // Choose the initial delivery node station code based on where the train is heading
  let deliveryStop = routeStops[Math.min(currentStationIndex + 1, routeStops.length - 1)];
  // We should prefer a serviceable stop for delivery if possible
  const possibleStops = routeStops.slice(currentStationIndex);
  const matchedServiceable = possibleStops.find(s => checkIsServiceable(s, []));
  if (matchedServiceable) {
    deliveryStop = matchedServiceable;
  }

  return {
    pnr,
    trainNo: selectedDef.trainNo,
    trainName: selectedDef.trainName,
    coach,
    seat,
    journeyDate: formatJourneyDate(refTime),
    currentDelayMins,
    currentStationIndex,
    stationCode: deliveryStop.stationCode,
    stationName: deliveryStop.stationName,
    routeStops
  };
};
