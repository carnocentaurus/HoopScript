import { Strategy, OffensiveFocus, DefensiveFocus, PlayerStat } from '../types/save';
import { calculateGameScore } from './statsMath';

export type GameIntensity = 'clutch' | 'normal' | 'blowout';

export interface GameNarrative {
  analysisLines: string[];
  lossReason: string;
}

export interface NarrativeParams {
  userWon: boolean;
  tacticsSuccessful: boolean;
  coachIQ: number;
  myScore: number;
  oppScore: number;
}

export const getNarrative = (params: NarrativeParams): GameNarrative => {
  return { analysisLines: [], lossReason: "" };
};

export const getGameIntensity = (myPts: number, oppPts: number): GameIntensity => {
  const diff = Math.abs(myPts - oppPts);
  if (diff <= 5) return 'clutch';
  if (diff >= 10) return 'blowout'; // Updated from 15 to 10
  return 'normal';
};

export interface AnalysisParams {
  userWon: boolean;
  intensity: GameIntensity;
  userOffense: string;
  oppDefense: string;
  topScorer: PlayerStat;
  oppBestPlayer: PlayerStat;
  homeStats: PlayerStat[];
  awayStats: PlayerStat[];
  scoreDiff: number;
  isCountered: boolean;
  isCountering: boolean;
}

// Helper to grab a random line from a pool
const pick = (lines: string[]) => lines[Math.floor(Math.random() * lines.length)];

/**
 * DETECTS STATISTICAL MILESTONES
 */
const checkMilestones = (player: PlayerStat) => {
  const stats = [player.pts, player.reb, player.ast, player.stl, player.blk];
  const countsGE10 = stats.filter(s => s >= 10).length;
  
  let milestone = "";
  if (countsGE10 >= 3) milestone = "Triple-Double";
  else if (countsGE10 >= 2) milestone = "Double-Double";

  const defensiveAnchor = (player.stl + player.blk) >= 5;
  const highTurnovers = player.tov >= 5;

  return { milestone, defensiveAnchor, highTurnovers };
};

const MILESTONE_LINES = [
  "Historic Night: ${name} posted a massive ${milestone}, dominating every facet of the floor.",
  "All-Around Masterclass: ${name} stuffed the stat sheet with a ${milestone}, proving to be the ultimate Swiss Army knife tonight.",
  "Statistical Dominance: Whether it was scoring, boards, or facilitating, ${name} was everywhere, logging a massive ${milestone}."
];

const DEFENSIVE_LINES = {
  BLOCKS: [
    "No Fly Zone: ${name} anchored the defense with ${blocks} blocks, making every entry pass a risk.",
    "Paint Protector: The interior was off-limits tonight as ${name} swatted ${blocks} shots, effectively erasing easy looks at the rim."
  ],
  STEALS: [
    "Thievery in the Passing Lanes: ${name} was a nightmare for their ball-handlers, snagging ${steals} steals and fueling our transition game."
  ],
  GENERAL: [
    "Defensive Anchor: ${name} was everywhere on the defensive end, disrupting the opponent's rhythm all night."
  ]
};

const TURNOVER_LINES = {
  WIN: [
    "Careless but Capable: Despite ${name}'s ${to} turnovers, the team survived the sloppy play.",
    "Escaping the Mess: We survived ${name}'s ${to} giveaways, though the lack of ball security made this win much harder than it needed to be.",
    "Unforced Errors: Despite ${name} struggling with ${to} turnovers, the team's overall efficiency masked the individual sloppiness."
  ],
  LOSS: [
    "Ball Security Crisis: ${name}'s ${to} turnovers proved fatal, gifting the opponent easy transition buckets.",
    "Point of Failure: It is impossible to win when your primary option coughs up the ball ${to} times; the turnovers completely stalled our momentum.",
    "Self-Inflicted Wounds: ${name}'s ${to} turnovers were the story of the game, as we repeatedly handed the ball back to an opponent who capitalized on every mistake."
  ]
};

const TACTICAL_MAP: any = {
  OFFENSE: {
    [OffensiveFocus.ATTACK_PAINT]: { counteredBy: DefensiveFocus.PROTECT_RIM, exploits: DefensiveFocus.PERIMETER_LOCK },
    [OffensiveFocus.PACE_SPACE]: { counteredBy: DefensiveFocus.PERIMETER_LOCK, exploits: DefensiveFocus.DOUBLE_TEAM },
    [OffensiveFocus.ISO_STAR]: { counteredBy: DefensiveFocus.DOUBLE_TEAM, exploits: DefensiveFocus.PROTECT_RIM }
  }
};

/**
 * DETERMINES TACTICAL NARRATIVE WITH VARIATION
 */
export const getTacticalNarrative = (
  userOffense: string, 
  oppDefense: string, 
  starFG: number, 
  starName: string,
  userWon: boolean,
  intensity: GameIntensity
): string => {
  const mapping = TACTICAL_MAP.OFFENSE[userOffense];
  
  const stalemates = [
    "Tactical Stalemate: Both teams played to their strengths, but neither side gained a clear schematic advantage.",
    "Gridlock: The tactical battle ended in a draw, forcing the players to win it on sheer talent.",
    "Matching Wits: Both coaching staffs anticipated the other's moves, resulting in a wash."
  ];

  if (!mapping) return pick(stalemates);

  // SCENARIO 1: YOU WERE COUNTERED
  if (oppDefense === mapping.counteredBy) {
    if (userWon) {
      if (starFG > 55) {
        return pick([
          `Brute Force: They had the right scheme to stop your ${userOffense}, but ${starName} was simply too talented to be contained.`,
          `Skill Gap: Despite being tactically countered, ${starName} powered through their ${oppDefense} with elite shot-making.`,
          `Outplaying the Blueprint: The scheme was a failure, but ${starName} saved the day by ignoring the double-teams.`
        ]);
      }
      return pick([
        `Gritty Survival: Their ${oppDefense} nearly neutralized our ${userOffense}, but we found a way to win the ${intensity} battle anyway.`,
        `Winning Ugly: We were tactically outmatched by their ${oppDefense}, but pure execution secured the victory.`,
        `Overcoming the Odds: Despite a schematic disadvantage, the roster powered through to a victory.`
      ]);
    }
    // Lost and countered
    return pick([
      `Tactical Failure: Their ${oppDefense} successfully neutralized your ${userOffense}.`,
      `Out-Coached: We walked right into their ${oppDefense} and never found an answer.`,
      `System Shutdown: The coaching staff failed to adjust as the ${oppDefense} stifled our ${userOffense}.`
    ]);
  }

  // SCENARIO 2: YOU COUNTERED THEM
  if (oppDefense === mapping.exploits) {
    if (userWon) {
      return pick([
        `Tactical Edge: Your ${userOffense} successfully exploited their ${oppDefense}.`,
        `Schematic Masterclass: We completely dismantled their ${oppDefense} by sticking to our ${userOffense} philosophy.`,
        `The Right Blueprint: Our scouts nailed it—their ${oppDefense} had no answer for our ${userOffense}.`
      ]);
    }
    // Countered them but lost
    return pick([
      `Empty Edge: The strategy was perfect, but even exploiting their ${oppDefense} wasn't enough to secure the win.`,
      `Wasted Blueprint: Our ${userOffense} worked as intended, but we failed to capitalize in the ${intensity} moments.`,
      `Execution Deficit: We won the coaching battle, but the performance on the floor let us down.`
    ]);
  }

  return pick(stalemates);
};

/**
 * GENERATES DYNAMIC ANALYSIS
 */
export const getPostGameAnalysis = (params: AnalysisParams): string[] => {
  const { userWon, intensity, userOffense, oppDefense, topScorer, oppBestPlayer, scoreDiff } = params;
  const lines: string[] = [];

  const oppFGPercent = oppBestPlayer.fga > 0 ? (oppBestPlayer.fgm / oppBestPlayer.fga) * 100 : 0;
  const opp3PPercent = oppBestPlayer.threePA > 0 ? (oppBestPlayer.threePM / oppBestPlayer.threePA) * 100 : 0;
  const starFGPercent = topScorer.fga > 0 ? (topScorer.fgm / topScorer.fga) * 100 : 0;
  
  const isLockdown = oppFGPercent < 42 && opp3PPercent < 33;
  const isDefensiveBreach = oppFGPercent > 50;

  // 1. Tactical Reason (Updated to pass userWon and intensity)
  lines.push(getTacticalNarrative(userOffense, oppDefense, starFGPercent, topScorer.lastName, userWon, intensity));

  // 2. Star Player Impact
  if (userWon) {
    lines.push(pick([
      `Maintained Pressure: ${topScorer.lastName} was the difference-maker, dropping ${topScorer.pts} points.`,
      `Leading the Charge: ${topScorer.lastName} took over when it mattered most, finishing with ${topScorer.pts} points.`,
      `Elite Execution: A dominant ${topScorer.pts}-point night from ${topScorer.lastName} secured the victory.`
    ]));
  } else {
    lines.push(pick([
      `${topScorer.lastName} carried the load with ${topScorer.pts} points, but we were outclassed as a unit.`,
      `Empty Stats: Despite ${topScorer.pts} points from ${topScorer.lastName}, the rest of the roster struggled to contribute.`,
      `Sole Provider: ${topScorer.lastName} gave us ${topScorer.pts} points, but we couldn't bridge the gap elsewhere.`
    ]));
  }

  // 3. Intensity/Differential
  if (intensity === 'clutch') {
    lines.push(pick([
      `Poise under pressure: ${userWon ? 'Winning' : 'Losing'} a ${scoreDiff}-point game came down to the final possessions.`,
      `Down to the Wire: This ${scoreDiff}-point nail-biter was decided by sheer mental toughness in the final minute.`,
      `Heart-Stopper: A grueling battle that ${userWon ? 'went our way' : 'slipped through our fingers'} by just ${scoreDiff} points.`
    ]));
  } else if (intensity === 'blowout') {
    if (userWon) {
      lines.push(pick([
        `Dominant performance: We maintained a ${scoreDiff}-point lead by dictating the pace.`,
        `Total Command: A ${scoreDiff}-point victory shows we were the superior team tonight.`,
        `Blowout: We overwhelmed them, finishing with a commanding ${scoreDiff}-point margin.`
      ]));
    } else {
      lines.push(pick([
        `Uphill battle: We conceded a ${scoreDiff}-point gap as they dictated the tempo.`,
        `Outclassed: We had no answer for their run, resulting in a ${scoreDiff}-point defeat.`,
        `System Collapse: A ${scoreDiff}-point loss points to a total breakdown in execution.`
      ]));
    }
  } else if (intensity === 'normal') {
    lines.push(pick([
      `Steady execution: A ${scoreDiff}-point margin reflected consistent play from both sides.`,
      `Controlled Finish: We ${userWon ? 'held them off' : 'were kept at bay'} for a ${scoreDiff}-point conclusion.`,
      `Consistent Gap: Neither team went on a major run, keeping the game within ${scoreDiff} points.`
    ]));
  }

  // 4. Defensive Result
  if (userWon) {
    if (isLockdown) {
      lines.push(pick([
        `Defensive Lockdown: Your scheme limited ${oppBestPlayer.lastName} to ${Math.round(oppFGPercent)}% shooting.`,
        `Clamped Down: ${oppBestPlayer.lastName} was in handcuffs tonight, finishing at a miserable ${Math.round(oppFGPercent)}%.`,
        `Defensive Masterclass: We took ${oppBestPlayer.lastName} completely out of the game.`
      ]));
    } else if (isDefensiveBreach) {
      lines.push(`Defensive Breach: Despite the win, ${oppBestPlayer.lastName} was an unstoppable force, shooting a clinical ${Math.round(oppFGPercent)}%.`);
    } else {
      lines.push(`Stifled Offense: We contained ${oppBestPlayer.lastName} just enough to secure the victory.`);
    }
  } else {
    if (isDefensiveBreach) {
      lines.push(`Defensive Breach: Despite the scheme, ${oppBestPlayer.lastName} was unstoppable, shooting a clinical ${Math.round(oppFGPercent)}%.`);
    } else {
      lines.push(`Deficit in Coverage: ${oppBestPlayer.lastName} found too many openings, finishing with ${oppBestPlayer.pts} points.`);
    }
  }

  // 5. Milestones, Defense, and Ball Security (New)
  const userTeamStats = params.homeStats.find(p => p.lastName === topScorer.lastName) ? params.homeStats : params.awayStats;
  const extraLines: string[] = [];

  // POTG & Milestones
  let bestGameScore = -Infinity;
  let potg: PlayerStat | null = null;
  for (const p of userTeamStats) {
    const score = calculateGameScore(p);
    if (score > bestGameScore) {
      bestGameScore = score;
      potg = p;
    }
  }

  if (potg) {
    const { milestone } = checkMilestones(potg);
    if (milestone) {
      extraLines.push(pick(MILESTONE_LINES).replace("${name}", potg.lastName).replace("${milestone}", milestone));
    }
  }

  // Defensive Standout
  const defensiveStandout = userTeamStats.find(p => (p.stl + p.blk) >= 5);
  if (defensiveStandout) {
    let defLine = "";
    if (defensiveStandout.blk >= 3) {
      defLine = pick(DEFENSIVE_LINES.BLOCKS).replace("${name}", defensiveStandout.lastName).replace("${blocks}", defensiveStandout.blk.toString());
    } else if (defensiveStandout.stl >= 3) {
      defLine = pick(DEFENSIVE_LINES.STEALS).replace("${name}", defensiveStandout.lastName).replace("${steals}", defensiveStandout.stl.toString());
    } else {
      defLine = pick(DEFENSIVE_LINES.GENERAL).replace("${name}", defensiveStandout.lastName);
    }
    extraLines.push(defLine);
  }

  // Ball Security
  const highTOPlayer = userTeamStats.find(p => p.tov >= 5);
  if (highTOPlayer) {
    const toLines = userWon ? TURNOVER_LINES.WIN : TURNOVER_LINES.LOSS;
    extraLines.push(pick(toLines).replace("${name}", highTOPlayer.lastName).replace("${to}", highTOPlayer.tov.toString()));
  }

  // Randomly append 1-2 extra lines
  if (extraLines.length > 0) {
    const count = Math.min(extraLines.length, Math.floor(Math.random() * 2) + 1);
    const shuffled = extraLines.sort(() => 0.5 - Math.random());
    for (let i = 0; i < count; i++) {
      lines.push(shuffled[i]);
    }
  }

  return lines;
};