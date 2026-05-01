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
  coachVerdict: string;
  lossReason?: string;
}

export const getGameIntensity = (myPts: number, oppPts: number): GameIntensity => {
  const diff = Math.abs(myPts - oppPts);
  if (diff <= 5) return 'clutch';
  if (diff >= 10) return 'blowout';
  return 'normal';
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
  const { userWon, coachIQ, myScore, oppScore } = params;
  const intensity = getGameIntensity(myScore, oppScore);
  const coachVerdict = getCoachVerdict(userWon, coachIQ, intensity);

  return {
    coachVerdict
  };
};
