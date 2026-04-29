import { Strategy } from '../types/save';

export interface NarrativeParams {
  userWon: boolean;
  tacticsSuccessful: boolean;
  coachIQ: number;
  stats?: any;
}

const STRATEGIC_MASTERCLASS = [
  "A tactical clinic. Your offense left them scrambling for answers they didn't have.",
  "Textbook basketball. The team followed the blueprint to the letter, punishing every rotation.",
  "Total cohesion. We dictated the terms of engagement from the opening tip.",
  "Strategic dominance. Our spacing and movement made their defense look like it was standing in sand."
];

const THE_BAILOUT = [
  "Pure grit. We weren't the better team on the chalkboard, but we were the better team on the court.",
  "Survival mode. A shaky game plan was saved by sheer determination.",
  "We stole one tonight. The strategy was flawed, but individual brilliance bridged the gap.",
  "Ugly win, but it counts. The scheme was neutralized, but our talent refused to settle for a loss."
];

const THE_PAPER_TIGER = [
  "Sometimes the numbers lie. We won the tactical battle but lost the war at the rim.",
  "Right process, wrong result. If we play this game ten times with that plan, we win nine of them.",
  "A statistical anomaly. We generated elite looks all night, but the basketball gods were unkind.",
  "The scheme was a masterpiece; the execution was a disaster. High-quality looks resulted in empty trips."
];

const TOTAL_COLLAPSE = [
  "Back to the drawing board. We were reactive rather than proactive, and they made us pay.",
  "Outplayed and outmatched. Their defense acted as a cage for our entire roster.",
  "A tactical eclipse. Every adjustment we made was met with a perfect counter by the opposition.",
  "Total system failure. We had no answer for their rhythm for 48 minutes."
];

const highIQVerdicts = {
  win: [
    "A professional victory. We stayed disciplined, trusted the system, and let the results follow.",
    "A clinical performance. The squad executed the game plan perfectly.",
    "We forced them into difficult looks all night. A textbook win.",
    "Winning is a habit. We kept our composure when the momentum shifted.",
    "Disciplined basketball from start to finish. I'm proud of the focus."
  ],
  loss: [
    "A tough pill to swallow. The process was sound, but sometimes the shots just don't drop in this league.",
    "We'll look at the tape; our rotations were a half-second slow tonight. That's on me.",
    "Tough result, but I like the process. We generated the looks we wanted.",
    "Defensively, we lost our shape in the third quarter. We’ll analyze the tape and fix the spacing.",
    "We gave it away at the end. That's a painful learning experience for a any team."
  ]
};

const lowIQVerdicts = {
  win: [
    "I'm just relieved. The stars bailed us out of a shaky game plan.",
    "I'm not sure how we pulled that off, but I'll take the 'W' and run.",
    "We were lucky to get that one. The guys covered for some poor decision-making on my end.",
    "A win is a win, but we definitely didn't play our best basketball out there.",
    "We scraped by. I might need to rethink the rotation; I was flying by the seat of my pants."
  ],
  loss: [
    "I'll take the heat for this one. I didn't have the boys prepared for their adjustments.",
    "The lights seemed a bit too bright for us tonight. We just lacked the intensity.",
    "I'm not sure what happened. We looked lost out there for long stretches.",
    "I think I pushed the wrong buttons during the timeouts. It's on me.",
    "We just didn't have the fire needed to compete. Back to the drawing board."
  ]
};

const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export interface GameNarrative {
  headline: string;
  subHeadline: string;
  coachVerdict: string;
  lossReason?: string;
}

export const getNarrative = (params: NarrativeParams): GameNarrative => {
  const { userWon, tacticsSuccessful, coachIQ } = params;
  
  let headline = "";
  let subHeadline = "";
  
  if (userWon) {
    if (tacticsSuccessful) {
      headline = "Strategic Masterclass";
      subHeadline = getRandom(STRATEGIC_MASTERCLASS);
    } else {
      headline = "The Bailout";
      subHeadline = getRandom(THE_BAILOUT);
    }
  } else {
    if (tacticsSuccessful) {
      headline = "The Paper Tiger";
      subHeadline = getRandom(THE_PAPER_TIGER);
    } else {
      headline = "Total Collapse";
      subHeadline = getRandom(TOTAL_COLLAPSE);
    }
  }

  const verdicts = coachIQ >= 75 ? highIQVerdicts : lowIQVerdicts;
  const coachVerdict = getRandom(userWon ? verdicts.win : verdicts.loss);

  return {
    headline,
    subHeadline,
    coachVerdict
  };
};
