import { StyleSheet, Platform } from 'react-native';
import { COLORS, SPACING, FONTS } from './theme';

export const globalStyles = StyleSheet.create({
  // --- COMMON ---
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  blackContainer: {
    flex: 1,
    backgroundColor: COLORS.black,
    padding: SPACING.l,
    paddingTop: 60,
  },
  whiteContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  baseText: {
    fontFamily: FONTS.secondary,
    color: COLORS.text,
  },
  title: {
    color: COLORS.white,
    fontSize: 24,
    fontFamily: FONTS.primary,
    marginBottom: SPACING.l,
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  ratingsContainer: { 
    flexDirection: 'row', 
    gap: 15, 
    marginTop: 10 
  },
  ratingBox: { 
    alignItems: 'center' 
  },
  ratingVal: { 
    fontSize: 13, 
    fontFamily: FONTS.primary,
    color: COLORS.white 
  },
  ovrVal: { 
    color: COLORS.primary 
  },
  ratingLabel: { 
    fontSize: 8, 
    color: COLORS.textSub, 
    fontFamily: FONTS.primary,
    textTransform: 'uppercase',
  },

  // --- COMMON UTILITIES ---
  flex1: { flex: 1 },
  flexRow: { flexDirection: 'row' },
  flexRowAlignCenter: { flexDirection: 'row', alignItems: 'center' },
  justifyStart: { justifyContent: 'flex-start' },
  justifyBetween: { justifyContent: 'space-between' },
  flexRowWrapBetween: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  centerContent: { justifyContent: 'center', alignItems: 'center' },
  headerSpacer: { width: 60 },
  vSpacer20: { height: 20 },
  vSpacer40: { height: 40 },
  mb10: { marginBottom: 10 },
  mb15: { marginBottom: 15 },
  mb20: { marginBottom: 20 },
  mb30: { marginBottom: 30 },
  mb0: { marginBottom: 0 },
  mr8: { marginRight: 8 },
  pb20: { paddingBottom: 20 },
  fs12: { fontSize: 12 },
  fw900: { fontWeight: '900' },
  bgTransparent: { backgroundColor: 'transparent' },
  bgTerracotta: { backgroundColor: '#B34726' },
  textTerracotta: { color: '#B34726' },
  textBlackBold: { color: COLORS.black, fontFamily: FONTS.primary, textTransform: 'uppercase' },
  textSuccess: { color: COLORS.success },
  textError: { color: COLORS.error },

  // --- APP / YEAR SELECTION ---
  appScrollList: {
    flex: 1,
  },
  appScrollListContent: { 
    flexGrow: 1 
  },
  appYearButton: {
    padding: SPACING.m,
    backgroundColor: COLORS.darkCard,
    marginBottom: SPACING.s,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  appYearButtonPrimary: {
    backgroundColor: COLORS.primary, 
    borderLeftWidth: 0, 
    width: '48%', 
    marginBottom: 10 
  },
  appYearText: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: FONTS.secondary,
    textAlign: 'center',
  },
  appYearTextBlack: { 
    color: COLORS.black,
    fontFamily: FONTS.secondary,
    textAlign: 'center',
  },
  yearSelectionHeader: {
    color: COLORS.textSub,
    fontSize: 18,
    fontFamily: FONTS.primary,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 20,
  },

  // --- LOADING SCREEN ---
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogo: {
    width: 200,
    height: 200,
  },

  // --- SELECT SAVE SCREEN ---
  selectSaveContainer: { 
    flex: 1,
    justifyContent: 'center', 
    paddingHorizontal: 20 
  },
  selectSaveTitle: { 
    fontSize: 24, 
    fontFamily: FONTS.primary,
    textTransform: 'uppercase',
    textAlign: 'center', 
    marginBottom: 40, 
    letterSpacing: 2,
    color: COLORS.white
  },
  selectSaveSlotWrapper: { 
    marginBottom: 20 
  },
  selectSaveSlotCard: { 
    borderWidth: 2, 
    borderColor: COLORS.black, 
    padding: 25, 
    borderRadius: 12, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    backgroundColor: COLORS.primary
  },
  selectSaveSlotNumber: { 
    fontFamily: FONTS.primary,
    textTransform: 'uppercase',
    color: COLORS.black, 
    fontSize: 18, 
    letterSpacing: 1, 
    marginBottom: 4 
  },
  selectSaveInfo: { 
    fontSize: 18, 
    fontFamily: FONTS.primary,
    textTransform: 'uppercase',
    color: COLORS.black 
  },
  selectSaveStats: { 
    fontSize: 16, 
    fontFamily: FONTS.primary,
    textTransform: 'uppercase',
    color: COLORS.black, 
    textAlign: 'right' 
  },
  selectSaveYear: { 
    fontSize: 11, 
    color: COLORS.black, 
    textAlign: 'right', 
    marginTop: 2,
    fontFamily: FONTS.secondary,
  },
  selectSaveEmptyText: { 
    color: COLORS.black, 
    fontStyle: 'italic', 
    fontSize: 16,
    fontFamily: FONTS.secondary,
  },
  selectSaveDeleteBtn: { 
    position: 'absolute', 
    top: -10, 
    right: 10, 
    backgroundColor: COLORS.white, 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: COLORS.black 
  },
  selectSaveDeleteText: { 
    color: COLORS.black, 
    fontSize: 9, 
    fontFamily: FONTS.primary,
    textTransform: 'uppercase',
  },
  creditsBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    fontSize: 10
  },

  // --- STRATEGY & SCOUTING ---
  strategyBoardContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginTop: 10,
    marginBottom: 10
  },
  strategyTitle: {
    fontSize: 18,
    fontFamily: FONTS.primary,
    color: COLORS.white,
    textTransform: 'uppercase',
    marginBottom: 15,
    textAlign: 'center'
  },
  strategyRow: {
    marginBottom: 15
  },
  strategyLabel: {
    fontSize: 12,
    fontFamily: FONTS.secondary,
    color: COLORS.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase'
  },
  strategyOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  strategyOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    alignItems: 'center',
    marginHorizontal: 4
  },
  strategyOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.secondary
  },
  strategyOptionText: {
    fontSize: 10,
    fontFamily: FONTS.primary,
    color: COLORS.textSub,
    textAlign: 'center'
  },
  strategyOptionTextActive: {
    color: COLORS.primary
  },
  scoutBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 5
  },
  scoutReportCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary
  },
  scoutReportText: {
    fontSize: 12,
    color: COLORS.white,
    fontFamily: FONTS.secondary,
    fontStyle: 'italic'
  },
  scoutReportValue: {
    color: COLORS.primary,
    fontWeight: 'bold'
  },
  scoutStatusBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scoutStatusText: {
    color: '#F0F0F0',
    fontFamily: FONTS.primary,
    fontSize: 13,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  scoutStatusSubText: {
    color: '#F0F0F0',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 14,
  },
  scoutStrategyCard: {
    backgroundColor: '#1E1E1E',
    padding: 8,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  scoutStrategyAccent: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.orange,
  },
  scoutStrategyHeader: {
    color: COLORS.textSub,
    fontSize: 9,
    fontFamily: FONTS.primary,
    marginBottom: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  scoutStrategyValue: {
    color: COLORS.white,
    fontSize: 13,
    fontFamily: 'Oswald',
  },
  scoutChipRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  scoutChip: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  scoutChipLabel: {
    color: COLORS.textMuted,
    fontSize: 8,
    fontFamily: FONTS.primary,
    textTransform: 'uppercase',
  },
  scoutChipValue: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: 'Oswald',
  },
  scoutPredictabilityMonospace: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },

  // --- TACTICAL ANALYSIS ---
  tacticalCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  tacticalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tacticalLabel: {
    color: COLORS.textSub,
    fontSize: 10,
    fontFamily: FONTS.primary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  tacticalValue: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: 'Oswald',
  },
  outcomeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  outcomeBadgeText: {
    color: COLORS.black,
    fontSize: 10,
    fontFamily: FONTS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scoutHitBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoutHitText: {
    color: COLORS.white,
    fontSize: 8,
    fontFamily: FONTS.primary,
    textTransform: 'uppercase',
    marginLeft: 2,
  },
  coachingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // --- MODALS ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  scoutModalContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderWidth: 2,
    borderColor: COLORS.primary,
    elevation: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  scoutModalTitle: {
    fontSize: 18,
    fontFamily: FONTS.primary,
    color: COLORS.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center'
  },
  scoutModalContent: {
    marginVertical: 20,
  },
  scoutModalCity: {
    fontSize: 28,
    fontFamily: FONTS.primary,
    color: COLORS.white,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 10
  },
  scoutModalReport: {
    marginTop: 10,
  },
  analysisRow: {
    marginBottom: 20,
  },
  analysisLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontFamily: 'Oswald',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  analysisValue: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: 'Oswald',
  },
  analysisCounterText: {
    color: '#B34726',
    fontSize: 10,
    fontFamily: FONTS.secondary,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  analysisCounterWinText: {
    color: COLORS.success,
    fontSize: 10,
    fontFamily: FONTS.secondary,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  scoutModalText: {
    fontSize: 14,
    color: COLORS.textSub,
    fontFamily: FONTS.secondary,
    lineHeight: 20,
    textAlign: 'center'
  },
  scoutModalFocusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 25,
    gap: 15
  },
  scoutModalFocusItem: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  scoutModalFocusLabel: {
    fontSize: 9,
    fontFamily: FONTS.primary,
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 5,
    textTransform: 'uppercase'
  },
  scoutModalFocusValue: {
    fontSize: 13,
    fontFamily: FONTS.primary,
    color: COLORS.white,
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  scoutModalCloseBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10
  },
  scoutModalCloseBtnText: {
    fontSize: 14,
    fontFamily: FONTS.primary,
    color: COLORS.black,
    letterSpacing: 1,
    textTransform: 'uppercase'
  },

  // --- HOME SCREEN ---
  homeSeasonHeader: {
    paddingHorizontal: 20,
    marginTop: 10,
    flexDirection: 'row',
  },
  homeYearBadge: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  homeYearText: {
    color: COLORS.textSub,
    fontSize: 12,
    fontFamily: FONTS.primary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  homeBackBtn: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  homeHistoryBtn: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  homeHistoryBtnText: {
    color: COLORS.textSub,
    fontSize: 10,
    fontFamily: FONTS.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  homeTopNav: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    paddingHorizontal: 20, 
    paddingTop: 10 
  },
  homeStandingsBtn: { 
    paddingVertical: 8, 
    paddingHorizontal: 15, 
    backgroundColor: COLORS.card, 
    borderRadius: 20, 
    elevation: 2, 
    shadowColor: COLORS.black, 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  homeStandingsBtnText: { 
    fontSize: 10, 
    fontFamily: FONTS.primary, 
    color: COLORS.text, 
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  homeMainContent: { 
    flex: 1, 
    justifyContent: 'center', 
    paddingHorizontal: 16 
  },
  homeSectionLabelCenter: { 
    color: COLORS.textSub, 
    fontSize: 10, 
    fontFamily: FONTS.primary, 
    textAlign: 'center', 
    letterSpacing: 2, 
    marginBottom: 25,
    textTransform: 'uppercase',
  },
  homeSectionLabelCenterBold: { 
    color: COLORS.textSub, 
    fontSize: 10, 
    fontFamily: FONTS.primary, 
    textAlign: 'center', 
    letterSpacing: 2, 
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  homeMatchupWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  homeMatchupCard: { 
    flex: 1, 
    backgroundColor: COLORS.card, 
    paddingVertical: 30, 
    paddingHorizontal: 10, 
    borderRadius: 20, 
    alignItems: 'center', 
    elevation: 4, 
    shadowColor: COLORS.black, 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    position: 'relative', 
    borderWidth: 2, 
    borderColor: COLORS.border 
  },
  homeUserCard: { 
    borderColor: COLORS.primary 
  },
  homeUserBadge: { 
    position: 'absolute', 
    top: -10, 
    backgroundColor: COLORS.primary, 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 12, 
    zIndex: 1 
  },
  homeUserBadgeText: { 
    color: COLORS.white, 
    fontSize: 9, 
    fontFamily: FONTS.primary,
    textTransform: 'uppercase',
  },
  homeMatchupLogo: { 
    fontSize: 42, 
    fontFamily: FONTS.primary, 
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  homeMatchupLogoImage: {
    width: 90,
    height: 90,
    marginBottom: 12,
    resizeMode: 'contain'
  },
  homeUserLogoText: { 
    color: COLORS.text,
    fontFamily: FONTS.primary,
    textTransform: 'uppercase',
  },
  homeOppLogoText: { 
    color: COLORS.grayLighter,
    fontFamily: FONTS.primary,
    textTransform: 'uppercase',
  },
  homeMatchupCity: { 
    fontSize: 16, 
    fontFamily: FONTS.primary, 
    color: COLORS.text, 
    textTransform: 'uppercase' 
  },
  homeMatchupSub: { 
    color: COLORS.textMuted, 
    fontSize: 11, 
    marginTop: 4, 
    fontFamily: FONTS.primary,
    textTransform: 'uppercase',
  },
  homeVenueBadge: { 
    marginTop: 15, 
    paddingHorizontal: 12, 
    paddingVertical: 4, 
    borderRadius: 10 
  },
  homeBadge: { 
    backgroundColor: COLORS.grayLight 
  },
  awayBadge: { 
    backgroundColor: COLORS.grayBackground 
  },
  homeVenueText: { 
    fontSize: 10, 
    fontFamily: FONTS.primary, 
    color: COLORS.primary, 
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  homeVsContainer: { 
    width: 40, 
    alignItems: 'center' 
  },
  homeVsText: { 
    color: COLORS.grayLighter, 
    fontFamily: FONTS.primary, 
    fontSize: 16,
    textTransform: 'uppercase',
  },
  homeProgressSection: { 
    marginTop: 60, 
    paddingHorizontal: 20, 
    minHeight: 80, 
    justifyContent: 'center' 
  },
  homeProgressInfo: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 10, 
    alignItems: 'baseline' 
  },
  homeProgressLabel: { 
    color: COLORS.textSub, 
    fontSize: 10, 
    fontFamily: FONTS.primary, 
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  homeProgressBarBg: { 
    width: '100%', 
    height: 8, 
    backgroundColor: COLORS.border, 
    borderRadius: 4, 
    overflow: 'hidden' 
  },
  homeProgressBarFill: { 
    height: '100%', 
    backgroundColor: COLORS.primary 
  },
  homeStatsText: { 
    color: COLORS.textSub, 
    fontSize: 10, 
    fontFamily: FONTS.primary,
    textTransform: 'uppercase',
  },
  homeSeriesScoreContainer: { 
    alignItems: 'center' 
  },
  homeSeriesLabel: { 
    color: COLORS.textSub, 
    fontSize: 9, 
    fontFamily: FONTS.primary, 
    letterSpacing: 1.5, 
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  homeSeriesScoreText: { 
    color: COLORS.text, 
    fontSize: 32, 
    fontFamily: FONTS.primary, 
    letterSpacing: 10,
    textTransform: 'uppercase',
  },
  homeSeriesSubText: { 
    color: COLORS.textMuted, 
    fontSize: 10, 
    fontFamily: FONTS.primary, 
    marginTop: 8,
    textTransform: 'uppercase',
  },
  homeEndSeasonContainer: { 
    alignItems: 'center', 
    padding: 20 
  },
  homeEndSeasonIcon: { 
    fontSize: 64, 
    marginBottom: 20 
  },
  homeEndSeasonTitle: { 
    fontSize: 22, 
    fontFamily: FONTS.primary, 
    color: COLORS.text, 
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  homeEndSeasonSub: { 
    fontSize: 14, 
    color: COLORS.textMuted, 
    textAlign: 'center', 
    marginTop: 10, 
    lineHeight: 20,
    fontFamily: FONTS.secondary,
  },
  homeBottomButtonsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
  },
  homeSimButton: { 
    backgroundColor: '#B34726', 
    marginHorizontal: 20, 
    padding: 20, 
    borderRadius: 16, 
    alignItems: 'center', 
    elevation: 8 
  },
  homeSimButtonText: { 
    color: COLORS.black, 
    fontFamily: FONTS.primary, 
    fontSize: 16, 
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  homeBracketButton: {
    backgroundColor: '#B34726',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 8,
  },
  homeBracketButtonText: {
    color: COLORS.black,
    fontFamily: FONTS.primary,
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // --- QUICK SIM SCREEN ---
  qsScrollContent: { paddingBottom: 40 },
  qsHeaderRow: { padding: 15, paddingBottom: 0 },
  qsBackBtn: { padding: 10, width: 60 },
  qsScoreBoard: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', padding: 20 },
  qsTeamSide: { alignItems: 'center', flex: 1 },
  qsLogoPlaceholder: { fontSize: 40, color: COLORS.white, fontFamily: FONTS.primary, textTransform: 'uppercase', backgroundColor: COLORS.grayLight, width: 80, height: 80, textAlign: 'center', lineHeight: 80, borderRadius: 40, marginBottom: 10 },
  qsLogoImage: { 
    width: 90, 
    height: 90, 
    marginBottom: 10, 
    resizeMode: 'contain' 
  },
  qsCityName: { color: COLORS.textSub, fontSize: 12, fontFamily: FONTS.primary, textTransform: 'uppercase' },
  qsScore: { color: COLORS.text, fontSize: 54, fontFamily: FONTS.primary, marginTop: 10 },
  qsVs: { color: COLORS.border, fontFamily: FONTS.primary, fontSize: 18, textTransform: 'uppercase' },
  qsWinner: { color: COLORS.success },
  qsOtBadge: { alignSelf: 'center', backgroundColor: COLORS.accent, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, marginBottom: 10 },
  qsOtText: { color: COLORS.black, fontFamily: FONTS.primary, fontSize: 11, textTransform: 'uppercase' },
  qsPostGame: { marginTop: 10, paddingHorizontal: 20 },
  qsWinnerTerracotta: { color: '#B34726' },
  qsContinueButtonTerracotta: { backgroundColor: '#B34726', padding: 18, borderRadius: 12, alignItems: 'center' },
  qsContinueTextBlack: { fontFamily: FONTS.primary, fontSize: 16, color: COLORS.black, textTransform: 'uppercase' },
  qsQuarterIndicator: {
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  qsQuarterText: {
    color: COLORS.primary,
    fontFamily: FONTS.primary,
    fontSize: 22,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // --- STANDINGS SCREEN ---
  stHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  stTitle: { fontSize: 18, fontFamily: FONTS.primary, letterSpacing: 1, color: COLORS.white, textTransform: 'uppercase' },
  stTabBar: { flexDirection: 'row', borderBottomWidth: 1, borderColor: COLORS.border },
  stTab: { flex: 1, padding: 15, alignItems: 'center' },
  stActiveTab: { borderBottomWidth: 3, borderColor: COLORS.primary },
  stTabText: { color: COLORS.textMuted, fontFamily: FONTS.primary, textTransform: 'uppercase' },
  stActiveTabText: { color: COLORS.white, fontFamily: FONTS.primary, textTransform: 'uppercase' },
  stTableHeader: { flexDirection: 'row', padding: 15, backgroundColor: COLORS.card, borderBottomWidth: 1, borderColor: COLORS.border },
  stHeaderRank: { width: 30, fontSize: 10, color: COLORS.textMuted, fontFamily: FONTS.primary, textTransform: 'uppercase' },
  stHeaderTeam: { flex: 1, fontSize: 10, color: COLORS.textMuted, fontFamily: FONTS.primary, textTransform: 'uppercase' },
  stRecordColsHeader: { flexDirection: 'row', width: 120, justifyContent: 'space-between' },
  stHeaderStat: { fontSize: 10, color: COLORS.textMuted, fontFamily: FONTS.primary, width: 30, textAlign: 'center', textTransform: 'uppercase' },
  stHeaderStreak: { width: 40, fontSize: 10, color: COLORS.textMuted, fontFamily: FONTS.primary, textAlign: 'center', textTransform: 'uppercase' },
  stTeamRow: { flexDirection: 'row', padding: 15, alignItems: 'center', borderBottomWidth: 1, borderColor: COLORS.border },
  stUserRow: { backgroundColor: COLORS.grayLight },
  stRankText: { width: 30, fontFamily: FONTS.primary, color: COLORS.textSub },
  stLogoImage: { width: 30, height: 30, marginRight: 10, resizeMode: 'contain' },
  stCityName: { flex: 1, fontFamily: FONTS.secondary, fontSize: 18, color: COLORS.text },
  stRecordCols: { flexDirection: 'row', width: 120, justifyContent: 'space-between', alignItems: 'center' },
  stRecordText: { width: 30, textAlign: 'center', fontFamily: FONTS.primary, color: COLORS.text },
  stStreakText: { width: 40, textAlign: 'center', fontFamily: FONTS.primary, fontSize: 12 },
  stStreakWin: { color: COLORS.success },
  stStreakLoss: { color: COLORS.error },

  // --- DRAFT SCREEN ---
  drHeader: { padding: 20, alignItems: 'center', backgroundColor: COLORS.darkBg },
  drHeaderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 15 },
  drTitle: { color: COLORS.white, fontSize: 12, fontFamily: FONTS.primary, letterSpacing: 4, marginBottom: 0, textTransform: 'uppercase' },
  drTeamViewBtn: { backgroundColor: COLORS.secondary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, borderWidth: 1, borderColor: COLORS.border },
  drTeamViewBtnText: { color: COLORS.textSub, fontSize: 9, fontFamily: FONTS.primary, letterSpacing: 1, textTransform: 'uppercase' },
  drOnClockCard: { alignItems: 'center' },
  drOnClockLabel: { color: COLORS.primary, fontSize: 10, fontFamily: FONTS.primary, letterSpacing: 1, textTransform: 'uppercase' },
  drOnClockTeam: { color: COLORS.white, fontSize: 24, fontFamily: FONTS.primary, marginVertical: 4, textTransform: 'uppercase' },
  drPickNumber: { color: COLORS.textSub, fontSize: 12, fontFamily: FONTS.secondary },
  drSimBtn: { backgroundColor: COLORS.secondary, margin: 15, padding: 12, borderRadius: 8, alignItems: 'center' },
  drSimBtnText: { color: COLORS.white, fontFamily: FONTS.primary, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' },
  drListContainer: { paddingHorizontal: 15, paddingBottom: 20 },
  drListHeader: { fontSize: 12, fontFamily: FONTS.primary, color: COLORS.textMuted, marginVertical: 15, letterSpacing: 1, textTransform: 'uppercase' },
  drPlayerCard: { flexDirection: 'row', backgroundColor: COLORS.card, padding: 15, borderRadius: 12, marginBottom: 10, alignItems: 'center', elevation: 2 },
  drPlayerInfo: { flex: 1 },
  drPlayerName: { fontSize: 18, fontFamily: FONTS.secondary, color: COLORS.text },
  drPlayerSub: { color: COLORS.textMuted, fontFamily: FONTS.primary, fontSize: 12, marginTop: 2, textTransform: 'uppercase' },
  drRatingBox: { alignItems: 'center', marginRight: 15 },
  drRatingVal: { fontSize: 20, fontFamily: FONTS.primary, color: COLORS.primary },
  drRatingLabel: { fontSize: 8, color: COLORS.textSub, fontFamily: FONTS.primary, textTransform: 'uppercase' },
  drPickBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  drPickBtnText: { color: COLORS.white, fontFamily: FONTS.primary, fontSize: 12, textTransform: 'uppercase' },
  drSummaryRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, padding: 12, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  drUserSummaryRow: { borderColor: COLORS.primary, backgroundColor: COLORS.grayLight },
  drSummaryPick: { width: 40, fontSize: 12, fontFamily: FONTS.primary, color: COLORS.textMuted },
  drLogoImage: { width: 28, height: 28, marginRight: 10, resizeMode: 'contain' },
  drSummaryInfo: { flex: 1 },
  drSummaryTeam: { fontSize: 10, fontFamily: FONTS.primary, color: COLORS.primary, textTransform: 'uppercase' },
  drUserSummaryText: { color: COLORS.secondary, fontFamily: FONTS.primary, textTransform: 'uppercase' },
  drSummaryPlayer: { fontSize: 14, fontFamily: FONTS.secondary, color: COLORS.text },
  drSummaryRating: { alignItems: 'center' },
  drSummaryRatingVal: { fontSize: 14, fontFamily: FONTS.primary, color: COLORS.text },
  drSummaryRatingLabel: { fontSize: 7, fontFamily: FONTS.primary, color: COLORS.textSub, textTransform: 'uppercase' },
  drStartSeasonBtn: { backgroundColor: COLORS.secondary, margin: 20, padding: 18, borderRadius: 12, alignItems: 'center' },
  drStartSeasonBtnText: { color: COLORS.white, fontFamily: FONTS.primary, fontSize: 14, letterSpacing: 1, textTransform: 'uppercase' },

  // --- TEAM OVERVIEW SCREEN ---
  tosHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 15 },
  tosBackBtn: { width: 60 },
  tosTitle: { color: COLORS.textSub, fontSize: 18, fontFamily: FONTS.primary, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center' },
  tosLogoImage: { width: 40, height: 40, marginRight: 12, resizeMode: 'contain' },
  tosContainer: { flex: 1, paddingHorizontal: 15 },
  tosTrophySection: { alignItems: 'center', backgroundColor: COLORS.darkBg, padding: 20, borderRadius: 15, marginVertical: 15 },
  tosTrophyIcon: { fontSize: 32 },
  tosTrophyCount: { color: COLORS.white, fontSize: 24, fontFamily: FONTS.primary, marginTop: 5 },
  tosTrophyLabel: { color: COLORS.textSub, fontSize: 10, fontFamily: FONTS.primary, letterSpacing: 1, textTransform: 'uppercase' },
  tosTeamRatingsRow: { flexDirection: 'row', justifyContent: 'center', gap: 40, marginBottom: 25, backgroundColor: COLORS.background, padding: 15, borderRadius: 12 },
  tosTeamRatingBox: { alignItems: 'center' },
  tosTeamRatingVal: { fontSize: 22, fontFamily: FONTS.primary, color: COLORS.white },
  tosTeamOvrVal: { color: COLORS.primary },
  tosTeamRatingLabel: { fontSize: 9, color: COLORS.textMuted, fontFamily: FONTS.primary, marginTop: 2, textTransform: 'uppercase' },
  tosSectionHeader: { color: COLORS.textSub, fontSize: 12, fontFamily: FONTS.primary, letterSpacing: 2, marginBottom: 10, marginLeft: 5, textTransform: 'uppercase' },
  tosPlayerCard: { backgroundColor: COLORS.card, borderRadius: 12, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, elevation: 2 },
  tosPlayerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  tosPlayerMain: { fontSize: 18, fontFamily: FONTS.secondary, color: COLORS.text },
  tosPlayerNum: { color: COLORS.accent, fontSize: 14, fontFamily: FONTS.primary },
  tosPlayerPos: { color: COLORS.textMuted, fontFamily: FONTS.primary, fontSize: 12, textTransform: 'uppercase' },
  tosRatingsRow: { flexDirection: 'row', gap: 15 },
  tosRatingItem: { alignItems: 'center' },
  tosRatingVal: { fontSize: 16, fontFamily: FONTS.primary, color: COLORS.text },
  tosRatingValSmall: { fontSize: 13, fontFamily: FONTS.primary, color: COLORS.text },
  tosOvrVal: { color: COLORS.primary },
  tosRatingLabel: { fontSize: 8, color: COLORS.textSub, fontFamily: FONTS.primary, textTransform: 'uppercase' },
  tosRatingLabelSmall: { fontSize: 7, color: COLORS.textSub, fontFamily: FONTS.primary, textTransform: 'uppercase' },
  tosRookieBadge: { backgroundColor: '#F6AD55', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  tosRookieBadgeText: { color: COLORS.white, fontSize: 8, fontFamily: FONTS.primary, letterSpacing: 0.5, textTransform: 'uppercase' },

  // --- TEAM OVERVIEW (PREVIEW) ---
  toHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginVertical: 15, zIndex: 1 },
  toBackBtn: { padding: 10, width: 60 },
  toHeaderText: { 
    fontSize: 18, 
    fontFamily: FONTS.primary, 
    textAlign: 'center', 
    color: COLORS.textSub, 
    textTransform: 'uppercase',
    marginTop: 10,
    letterSpacing: 1,
  },
  toTeamStatsRow: { flexDirection: 'row', justifyContent: 'center', gap: 30, marginBottom: 20, zIndex: 1 },
  toStatBox: { alignItems: 'center' },
  toStatVal: { fontSize: 24, fontFamily: FONTS.primary, color: COLORS.white },
  toStatLabel: { fontSize: 10, color: COLORS.textSub, fontFamily: FONTS.primary, textTransform: 'uppercase' },
  toLogoBanner: {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 1,
    paddingVertical: 10,
  },
  toLogoBannerImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  toPlayerCard: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderBottomColor: COLORS.border, alignItems: 'center' },
  toPlayerPos: { width: 40, fontFamily: FONTS.primary, color: COLORS.textSub, textTransform: 'uppercase' },
  toPlayerName: { flex: 1, fontSize: 16, color: COLORS.text, fontFamily: FONTS.secondary },
  toPlayerOvr: { fontFamily: FONTS.primary, fontSize: 16, color: COLORS.text },
  toSectionHeader: { backgroundColor: COLORS.card, padding: 10, paddingHorizontal: 15 },
  toSectionHeaderText: { fontSize: 12, fontFamily: FONTS.primary, color: COLORS.textSub, letterSpacing: 1, textTransform: 'uppercase' },
  toConfirmBtn: { backgroundColor: COLORS.primary, margin: 20, padding: 15, borderRadius: 10, alignItems: 'center' },
  toConfirmBtnText: { color: COLORS.white, fontFamily: FONTS.primary, fontSize: 16, textTransform: 'uppercase' },
  toConfirmBtnTextBlack: { color: COLORS.black, fontFamily: FONTS.primary, fontSize: 16, textTransform: 'uppercase' },

  // --- HISTORY SCREEN ---
  hiHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  hiHeaderBack: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  hiHeaderTitle: { color: COLORS.white, fontSize: 18, fontFamily: FONTS.primary, letterSpacing: 2, textTransform: 'uppercase' },
  hiScrollContent: { padding: 15 },
  hiHistoryCard: { backgroundColor: COLORS.card, borderRadius: 16, marginBottom: 15, padding: 20, borderWidth: 1, borderColor: COLORS.border },
  hiCardHeader: { flexDirection: 'column' },
  hiYearText: { color: COLORS.accent, fontSize: 12, fontFamily: FONTS.primary, letterSpacing: 1, textTransform: 'uppercase' },
  hiLogoImage: { width: 30, height: 30, marginRight: 10, resizeMode: 'contain' },
  hiChampRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  hiChampText: { color: COLORS.white, fontSize: 20, fontFamily: FONTS.primary, flex: 1, flexShrink: 1, textTransform: 'uppercase' },
  hiChampStats: { alignItems: 'flex-end', minWidth: 50 },
  hiChampStatText: { color: COLORS.primary, fontSize: 10, fontFamily: FONTS.primary, textTransform: 'uppercase' },
  hiUserSummary: { flexDirection: 'row', gap: 10, marginTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12, alignItems: 'center' },
  hiUserLabel: { color: COLORS.textMuted, fontSize: 10, fontFamily: FONTS.primary, letterSpacing: 1, textTransform: 'uppercase' },
  hiUserStat: { color: COLORS.textSub, fontSize: 13, fontFamily: FONTS.secondary },
  hiEmptyContainer: { padding: 40, alignItems: 'center' },
  hiEmptyText: { color: COLORS.textMuted, fontSize: 16, fontFamily: FONTS.secondary, textAlign: 'center' },

  // --- PLAYOFF BRACKET SCREEN ---
  pbHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  pbTitle: { fontSize: 18, fontFamily: FONTS.primary, color: COLORS.white, textTransform: 'uppercase' },
  pbContent: { padding: 16 },
  pbConferenceSection: { marginBottom: 20 },
  pbConferenceHeader: { fontSize: 12, fontFamily: FONTS.primary, color: COLORS.textSub, letterSpacing: 1.5, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 4, textTransform: 'uppercase' },
  pbSeriesCard: { backgroundColor: COLORS.card, borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2 },
  pbTeamRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6, alignItems: 'center' },
  pbTeamInfo: { flexDirection: 'row', alignItems: 'center' },
  pbRankLabel: { fontSize: 12, color: COLORS.textSub, fontFamily: FONTS.primary, width: 22, textAlign: 'left' },
  pbLogoImage: { width: 30, height: 30, marginRight: 10, resizeMode: 'contain' },
  pbTeamName: { fontSize: 18, fontFamily: FONTS.secondary, color: COLORS.text },
  pbWinner: { color: COLORS.primary, fontFamily: FONTS.secondary },
  pbScore: { fontSize: 18, fontFamily: FONTS.primary, color: COLORS.text },
  pbSimDayBtn: { backgroundColor: COLORS.secondary, margin: 20, padding: 18, borderRadius: 12, alignItems: 'center' },
  pbNextSeasonBtn: { backgroundColor: COLORS.success },
  pbSimDayBtnText: { color: COLORS.white, fontFamily: FONTS.primary, textTransform: 'uppercase' },
  pbChampContainer: { alignItems: 'center', marginTop: 20, padding: 20 },
  pbChampText: { fontSize: 20, fontFamily: FONTS.primary, color: COLORS.white, textTransform: 'uppercase' },

  // --- FULL PLAYOFF BRACKET SCREEN ---
  fpbRoundContainer: { marginBottom: 30 },
  fpbRoundTitle: { color: COLORS.textSub, fontSize: 14, fontFamily: FONTS.primary, letterSpacing: 2, marginBottom: 15, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 5, textTransform: 'uppercase' },

  // --- TEAM SELECTION SCREEN ---
  tsHeader: { fontSize: 20, fontFamily: FONTS.secondary, textAlign: 'center', marginVertical: 20, flex: 1, color: COLORS.white },
  tsHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 },
  tsBackBtn: { padding: 10, width: 60 },
  tsListContent: { paddingHorizontal: 10 },

  // --- TEAM CARD COMPONENT ---
  tcCard: { flex: 1, alignItems: 'center', margin: 8, paddingVertical: 10 },
  tcLogoCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.grayLight, justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
  tcLogoLetter: { fontSize: 24, fontFamily: FONTS.primary, color: COLORS.text, textTransform: 'uppercase' },
  tcLogoImage: { width: 40, height: 40, resizeMode: 'contain' },
  tcCityText: { fontSize: 12, textAlign: 'center', color: COLORS.text, fontFamily: FONTS.secondary },

  // --- DRAFT LOTTERY SCREEN ---
  dlHeader: { padding: 20, alignItems: 'center' },
  dlTitle: { color: COLORS.primary, fontSize: 28, fontFamily: FONTS.primary, letterSpacing: 2, textTransform: 'uppercase' },
  dlSubtitle: { color: COLORS.textMuted, fontSize: 12, fontFamily: FONTS.primary, marginTop: 5, textTransform: 'uppercase' },
  dlRevealContainer: { height: 280, justifyContent: 'center', alignItems: 'center', padding: 20 },
  dlBeginBtn: { backgroundColor: '#B34726', marginHorizontal: 20, marginVertical: 20, padding: 20, borderRadius: 16, alignItems: 'center', elevation: 8 },
  dlBeginBtnText: { color: COLORS.black, fontFamily: FONTS.primary, fontSize: 16, letterSpacing: 1, textTransform: 'uppercase' },
  dlActiveReveal: { alignItems: 'center', width: '100%' },
  dlPickLabel: { color: COLORS.textMuted, fontSize: 18, fontFamily: FONTS.primary, marginBottom: 10, textTransform: 'uppercase' },
  dlCityCard: { backgroundColor: COLORS.card, width: '100%', padding: 30, borderRadius: 20, alignItems: 'center', borderWidth: 2, borderColor: COLORS.border, marginBottom: 10 },
  dlLogoImage: { width: 100, height: 100, marginBottom: 20, resizeMode: 'contain' },
  dlCityName: { color: COLORS.white, fontSize: 32, fontFamily: FONTS.primary, textAlign: 'center', textTransform: 'uppercase' },
  dlRankLabel: { color: COLORS.textSub, fontSize: 12, fontFamily: FONTS.primary, marginTop: 10, textTransform: 'uppercase' },
  dlSummaryList: { padding: 15 },
  dlSummaryItem: { flexDirection: 'row', backgroundColor: COLORS.card, marginBottom: 8, padding: 15, borderRadius: 12, alignItems: 'center', opacity: 0.3 },
  dlRevealedItem: { opacity: 1, borderColor: COLORS.border, borderWidth: 1 },
  dlSummaryPick: { color: COLORS.primary, fontFamily: FONTS.primary, width: 40, fontSize: 16, textTransform: 'uppercase' },
  dlSummaryLogoImage: { width: 32, height: 32, marginRight: 10, resizeMode: 'contain' },
  dlSummaryCity: { color: COLORS.white, fontFamily: FONTS.secondary, flex: 1, fontSize: 18 },
  dlSummaryProj: { color: COLORS.textSub, fontSize: 12, fontFamily: FONTS.primary, textTransform: 'uppercase' },
  dlProjectedList: { flex: 1, paddingHorizontal: 20 },
  dlProjectedRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, alignItems: 'center' },
  dlProjectedCity: { color: COLORS.white, fontSize: 16, fontFamily: FONTS.secondary },
  dlProjectedSub: { color: COLORS.textMuted, fontSize: 11, fontFamily: FONTS.secondary, marginTop: 2 },
  dlProjectedPick: { color: COLORS.primary, fontSize: 16, fontFamily: FONTS.primary, textTransform: 'uppercase' },
  mainView: {
    flex: 1,
  },
});
