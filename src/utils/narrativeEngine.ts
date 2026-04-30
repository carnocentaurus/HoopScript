import { Strategy } from '../types/save';

export type GameIntensity = 'clutch' | 'normal' | 'blowout';

export interface NarrativeParams {
  userWon: boolean;
  tacticsSuccessful: boolean;
  coachIQ: number;
  myScore: number;
  oppScore: number;
  stats?: any;
}

export interface GameNarrative {
  headline: string;
  subHeadline: string;
  coachVerdict: string;
  lossReason?: string;
}

export const getGameIntensity = (myPts: number, oppPts: number): GameIntensity => {
  const diff = Math.abs(myPts - oppPts);
  if (diff <= 5) return 'clutch';
  if (diff >= 10) return 'blowout';
  return 'normal';
};

const narratives: Record<GameIntensity, Record<string, string[]>> = {
  clutch: {
    masterclass: [
      "A masterclass under pressure. The scheme held up perfectly down the stretch.",
      "Cool under fire. We executed the set plays perfectly while they panicked in the closing seconds.",
      "Strategic brilliance. We out-maneuvered them in crunch time to seal the victory.",
      "Down to the wire, and we didn't flinch. Our tactical preparation turned a chaotic finish into a calculated win."
    ],
    bailout: [
      "Survival by a thread. Individual heroics masked a deeply flawed tactical approach.",
      "A narrow escape. Our talent bailed us out when the game plan fell apart in the final minutes.",
      "Ugly but effective. We stole this one despite being out-coached down the stretch."
    ],
    paperTiger: [
      "Right process, cruel result. We executed the plan perfectly but the rim was unkind in the clutch.",
      "A heartbreaking anomaly. Our strategy generated elite looks that just wouldn't fall.",
      "Won the battle, lost the war. We out-maneuvered them tactically but fell short by a possession."
    ],
    collapse: [
      "A failure of adjustment. We were a step behind in the closing minutes and they made us pay.",
      "Strategic paralysis. Our inability to pivot in the final stretch cost us a winnable game.",
      "Out-thought and out-fought. We let them dictate the terms when the game was on the line."
    ]
  },
  normal: {
    masterclass: [
      "Controlled the tempo. Our tactical superiority allowed us to maintain a comfortable cushion.",
      "A solid professional win. We stuck to the blueprint and dictated the terms of engagement.",
      "Process-driven victory. Every adjustment we made widened the gap in our favor."
    ],
    bailout: [
      "Individual brilliance over system. We won the talent battle despite losing the chess match.",
      "Luck was on our side. A shaky scheme was rescued by timely buckets from our stars.",
      "The scoreboard lies. We were reactive all night but managed to out-muscle them."
    ],
    paperTiger: [
      "The numbers favored us, the scoreboard didn't. A frustrating loss despite sound execution.",
      "Quality over quantity. We created better looks than them, yet they walked away with the win.",
      "Statistical outlier. Playing this way wins nine times out of ten; tonight was the tenth."
    ],
    collapse: [
      "Systemic breakdown. We were reactive rather than proactive throughout the contest.",
      "Tactical stagnation. Their adjustments left us scrambling for answers we never found.",
      "Lost in the shuffle. A disjointed performance where the scheme and the squad were out of sync."
    ]
  },
  blowout: {
    masterclass: [
      "Complete tactical dominance. We left them with no answers from the opening tip.",
      "A systemic dismantling. Our offense was unstoppable while our defense acted as a cage.",
      "Total cohesion. The disparity in strategic preparation turned this into a one-sided clinic."
    ],
    bailout: [
      "Raw power victory. Our talent floor was simply too high for them to overcome our mistakes.",
      "A messy blowout. We triumphed through sheer physical superiority despite tactical confusion.",
      "Talent gap win. We didn't need a map to find the basket, even if the coach was lost."
    ],
    paperTiger: [
      "A tactical victory in a scoreboard disaster. The scheme worked, but our execution at the rim was non-existent.",
      "Masterful plan, zero results. We dissected their defense repeatedly only to miss the finishers.",
      "The 'Perfect Loss'. Everything went according to the chalkboard except for the actual scoring."
    ],
    collapse: [
      "A tactical nightmare. We had zero answers and let this game turn into an embarrassing blowout.",
      "A total dismantling. Our defensive scheme was shredded, and we were chasing them all night long.",
      "Total system failure. We were outclassed at every strategic level from the first whistle."
    ]
  }
};

const coachVerdicts: Record<'high' | 'low', Record<'win' | 'loss', Record<GameIntensity, string[]>>> = {
  high: {
    win: {
      clutch: [
        "We stayed poised when the pressure mounted. That's a professional close.",
        "Our late-game execution was the difference. We didn't beat ourselves.",
        "Trusting the system in the final two minutes is what won us this game."
      ],
      blowout: [
        "We kept our foot on the gas. Excellent discipline to maintain that intensity for 48 minutes.",
        "A total team effort. We didn't allow them a single window to get back into it.",
        "Clinical. We dominated the fundamentals and the scoreboard reflected that."
      ],
      normal: [
        "A professional victory. We stayed disciplined, trusted the system, and let the results follow.",
        "A clinical performance. The squad executed the game plan perfectly.",
        "We forced them into difficult looks all night. A textbook win.",
        "Winning is a habit. We kept our composure when the momentum shifted.",
        "Disciplined basketball from start to finish. I'm proud of the focus."
      ]
    },
    loss: {
      clutch: [
        "A tough pill to swallow. The process was right, but they made one more play than we did.",
        "We had the look we wanted at the end. That's basketball—sometimes it just doesn't drop.",
        "It came down to a few 50/50 balls. We'll learn from this and tighten up our late-game sets."
      ],
      blowout: [
        "We lost our shape early and never recovered. That's a failure of preparation, starting with me.",
        "They exposed our rotations tonight. We'll analyze the tape and rebuild the defensive scheme.",
        "Unacceptable lapse in focus. We allowed them to dictate every facet of that game."
      ],
      normal: [
        "A tough pill to swallow. The process was sound, but sometimes the shots just don't drop in this league.",
        "We'll look at the tape; our rotations were a half-second slow tonight. That's on me.",
        "Tough result, but I like the process. We generated the looks we wanted.",
        "Defensively, we lost our shape in the third quarter. We’ll analyze the tape and fix the spacing.",
        "We gave it away at the end. That's a painful learning experience for a any team."
      ]
    }
  },
  low: {
    win: {
      clutch: [
        "My heart was in my throat! I'm just glad the buzzer sounded when it did.",
        "The guys pulled it off despite my messy rotations. Pure heart at the end.",
        "I don't know how we escaped with that one, but I'll take it!"
      ],
      blowout: [
        "I didn't see that coming! Everything just seemed to work today for some reason.",
        "We caught them on a bad night and just kept scoring. I'm as surprised as you are.",
        "The hoop looked like an ocean for us today. Lucky bounce after lucky bounce."
      ],
      normal: [
        "I'm just relieved. The stars bailed us out of a shaky game plan.",
        "I'm not sure how we pulled that off, but I'll take the 'W' and run.",
        "We were lucky to get that one. The guys covered for some poor decision-making on my end.",
        "A win is a win, but we definitely didn't play our best basketball out there.",
        "We scraped by. I might need to rethink the rotation; I was flying by the seat of my pants."
      ]
    },
    loss: {
      clutch: [
        "I think I pushed the wrong buttons in the final minute. This one is on my shoulders.",
        "We were right there! I just couldn't find the right lineup to get us over the hump.",
        "I'm still scratching my head over that last play. We just didn't have the magic."
      ],
      blowout: [
        "The lights were definitely too bright for us today. We looked lost out there.",
        "I'll take the heat. I didn't have the boys ready for their speed.",
        "It was a disaster from the jump. I'm not sure where we go from here."
      ],
      normal: [
        "I'll take the heat for this one. I didn't have the boys prepared for their adjustments.",
        "The lights seemed a bit too bright for us tonight. We just lacked the intensity.",
        "I'm not sure what happened. We looked lost out there for long stretches.",
        "I think I pushed the wrong buttons during the timeouts. It's on me.",
        "We just didn't have the fire needed to compete. Back to the drawing board."
      ]
    }
  }
};

const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export const getCoachVerdict = (userWon: boolean, coachIQ: number, intensity: GameIntensity): string => {
  const iqType = coachIQ >= 70 ? 'high' : 'low';
  const isWin = userWon ? 'win' : 'loss';
  return getRandom(coachVerdicts[iqType][isWin][intensity]);
};

export const getNarrative = (params: NarrativeParams): GameNarrative => {
  const { userWon, tacticsSuccessful, coachIQ, myScore, oppScore } = params;

  const intensity = getGameIntensity(myScore, oppScore);
  let scenario = "";
  let headline = "";

  if (userWon) {
    if (tacticsSuccessful) {
      scenario = "masterclass";
      headline = "Strategic Masterclass";
    } else {
      scenario = "bailout";
      headline = "The Bailout";
    }
  } else {
    if (tacticsSuccessful) {
      scenario = "paperTiger";
      headline = "The Paper Tiger";
    } else {
      scenario = "collapse";
      headline = "Total Collapse";
    }
  }

  const subHeadline = getRandom(narratives[intensity][scenario]);
  const coachVerdict = getCoachVerdict(userWon, coachIQ, intensity);

  return {
    headline,
    subHeadline,
    coachVerdict
  };
};
