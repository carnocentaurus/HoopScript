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
  if (diff >= 10) return 'blowout';
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
  wasUserCountered: boolean;
  wasUserExploiting: boolean;
  wasOppCountered: boolean;
  wasOppExploiting: boolean;
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

const TURNOVER_LINES: any = {
  WIN: {
    blowout: [
      "Minor Speedbumps: We dominated the scoreboard so thoroughly that ${name}'s ${to} turnovers were merely a footnote in a commanding win.",
      "Overwhelming Talent: Despite ${name} coughing up the ball ${to} times, our offensive efficiency marginalized the mistakes in this blowout.",
      "Unstoppable Force: The team's double-digit lead was never in jeopardy, even with ${name}'s ${to} unforced errors stalling a few possessions."
    ],
    normal: [
      "Treading Water: We kept a steady cushion, but ${name}'s ${to} giveaways prevented us from truly pulling away and ending the game earlier.",
      "Managing the Mess: Despite ${name} losing the ball ${to} times, our consistent scoring kept the lead out of the opponent's reach.",
      "Room for Improvement: We secured a solid result, but cleaning up ${name}'s ${to} turnovers will be a priority to avoid closer games in the future."
    ],
    clutch: [
      "Careless but Capable: Despite ${name}'s ${to} turnovers, the team survived the sloppy play in a tight finish.",
      "Escaping the Mess: We survived ${name}'s ${to} giveaways, though the lack of ball security made this win much harder than it needed to be.",
      "Playing with Fire: In a game decided by a few possessions, ${name}'s ${to} turnovers nearly cost us the entire victory."
    ]
  },
  LOSS: [
    "Ball Security Crisis: ${name}'s ${to} turnovers proved fatal, gifting the opponent easy transition buckets.",
    "Point of Failure: It is impossible to win when your primary option coughs up the ball ${to} times; the turnovers completely stalled our momentum.",
    "Self-Inflicted Wounds: ${name}'s ${to} turnovers were the story of the game, as we repeatedly handed the ball back to an opponent who capitalized on every mistake."
  ]
};

/**
 * DETERMINES TACTICAL NARRATIVE WITH VARIATION
 */
export const getTacticalNarrative = (params: AnalysisParams): string => {
  const { 
    userWon, 
    wasUserCountered, 
    wasUserExploiting, 
    wasOppCountered, 
    wasOppExploiting 
  } = params;

  const userAdvantage = wasUserExploiting || wasOppCountered;
  const oppAdvantage = wasUserCountered || wasOppExploiting;

  // STALEMATE RULE: No clear advantage or cancel-out results in no narrative
  if ((userAdvantage && oppAdvantage) || (!userAdvantage && !oppAdvantage)) {
    return "";
  }

  // 1. User countered them and WON
  if (userAdvantage && userWon) {
    return pick([
      "Tactical Masterclass: Your strategic superiority completely dismantled their game plan, securing a decisive victory.",
      "Out-Coached: Your scouts nailed the preparation, allowing you to exploit every weakness in their system.",
      "Schematic Dominance: A flawless execution of your counter-strategy left the opponent without answers tonight."
    ]);
  }

  // 2. User countered them but LOST
  if (userAdvantage && !userWon) {
    return pick([
      "Wasted Blueprint: Your strategy perfectly countered their setups, but execution on the floor failed to capitalize on the coaching advantage.",
      "Tactical Edge, Personnel Deficit: Despite holding the schematic upper hand, a lack of execution or talent gap resulted in a frustrating loss.",
      "System Success, Scoreboard Failure: You won the chess match on the sidelines, but the rims were unkind in a game where the math was on your side."
    ]);
  }

  // 3. Opponent countered user and user LOST
  if (oppAdvantage && !userWon) {
    return pick([
      "Tactical Shutdown: The opposing coach anticipated your schemes perfectly, locking down your options and cruising to a win.",
      "Schematic Failure: You walked right into their traps; their defensive adjustments neutralized your primary weapons.",
      "Out-Manuevered: They stayed one step ahead of your rotations, forcing you into low-efficiency looks all night."
    ]);
  }

  // 4. Opponent countered user but user WON
  if (oppAdvantage && userWon) {
    return pick([
      "Talent over Tactics: You were thoroughly out-coached and countered tactically, but your players' raw grit and talent bailed you out.",
      "Escaping the Trap: Despite being schemetically dismantled, elite individual performances secured a win you probably didn't deserve.",
      "Brute Force Victory: The coaching battle was a loss, but your roster's sheer talent powered through their tactical blockade."
    ]);
  }

  return "";
};

/**
 * GENERATES DYNAMIC ANALYSIS
 */
export const getPostGameAnalysis = (params: AnalysisParams): string[] => {
  const { userWon, intensity, topScorer, oppBestPlayer, scoreDiff } = params;
  const lines: string[] = [];

  const oppFGPercent = oppBestPlayer.fga > 0 ? (oppBestPlayer.fgm / oppBestPlayer.fga) * 100 : 0;
  const opp3PPercent = oppBestPlayer.threePA > 0 ? (oppBestPlayer.threePM / oppBestPlayer.threePA) * 100 : 0;
  
  const isLockdown = oppFGPercent < 42 && opp3PPercent < 33;
  const isDefensiveBreach = oppFGPercent > 50;

  // 1. Tactical Reason (4-Variation Matrix)
  const tacticalLine = getTacticalNarrative(params);
  if (tacticalLine) lines.push(tacticalLine);

  // 2. Star Player Impact (Only for 25+ points)
  if (topScorer.pts >= 25) {
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
  const eliteDefender = userTeamStats.find(p => p.stl >= 3 && p.blk >= 3);
  if (eliteDefender) {
    extraLines.push(`Elite Defensive Performance: ${eliteDefender.lastName} anchored the floor with ${eliteDefender.stl} steals and ${eliteDefender.blk} blocks.`);
  } else {
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
  }

  // Ball Security
  const highTOPlayer = userTeamStats.find(p => p.tov >= 5);
  if (highTOPlayer) {
    const toLines = userWon ? TURNOVER_LINES.WIN[intensity] : TURNOVER_LINES.LOSS;
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
