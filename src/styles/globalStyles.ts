import { StyleSheet } from 'react-native';
import { COLORS, SPACING } from './theme';

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
  title: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: SPACING.l,
    textAlign: 'center',
    letterSpacing: 2,
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
    fontWeight: '900', 
    color: COLORS.white 
  },
  ovrVal: { 
    color: COLORS.primary 
  },
  ratingLabel: { 
    fontSize: 8, 
    color: COLORS.textSub, 
    fontWeight: 'bold' 
  },

  // --- COMMON UTILITIES ---
  flex1: { flex: 1 },
  flexRow: { flexDirection: 'row' },
  flexRowAlignCenter: { flexDirection: 'row', alignItems: 'center' },
  justifyStart: { justifyContent: 'flex-start' },
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
  textBlackBold: { color: COLORS.black, fontWeight: '900' },
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
    fontWeight: 'bold',
    textAlign: 'center',
  },
  appYearTextBlack: { 
    color: COLORS.black 
  },
  yearSelectionHeader: {
    color: COLORS.textSub,
    fontSize: 18,
    fontWeight: 'bold',
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
    justifyContent: 'center', 
    paddingHorizontal: 20 
  },
  selectSaveTitle: { 
    fontSize: 24, 
    fontWeight: '900', 
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
    fontWeight: 'bold', 
    color: COLORS.black, 
    fontSize: 18, 
    letterSpacing: 1, 
    marginBottom: 4 
  },
  selectSaveInfo: { 
    fontSize: 18, 
    fontWeight: '900', 
    color: COLORS.black 
  },
  selectSaveStats: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: COLORS.black, 
    textAlign: 'right' 
  },
  selectSaveYear: { 
    fontSize: 11, 
    color: COLORS.black, 
    textAlign: 'right', 
    marginTop: 2 
  },
  selectSaveEmptyText: { 
    color: COLORS.black, 
    fontStyle: 'italic', 
    fontSize: 16 
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
    fontWeight: '900' 
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
    fontWeight: '900',
    letterSpacing: 1.5,
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
    fontWeight: '900',
    letterSpacing: 1,
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
    fontWeight: '800', 
    color: COLORS.text, 
    letterSpacing: 1 
  },
  homeMainContent: { 
    flex: 1, 
    justifyContent: 'center', 
    paddingHorizontal: 16 
  },
  homeSectionLabelCenter: { 
    color: COLORS.textSub, 
    fontSize: 10, 
    fontWeight: '900', 
    textAlign: 'center', 
    letterSpacing: 2, 
    marginBottom: 25 
  },
  homeSectionLabelCenterBold: { 
    color: COLORS.textSub, 
    fontSize: 10, 
    fontWeight: '900', 
    textAlign: 'center', 
    letterSpacing: 2, 
    marginBottom: 5 
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
    fontWeight: '900' 
  },
  homeMatchupLogo: { 
    fontSize: 42, 
    fontWeight: '900', 
    marginBottom: 12 
  },
  homeMatchupLogoImage: {
    width: 60,
    height: 60,
    marginBottom: 12,
    resizeMode: 'contain'
  },
  homeUserLogoText: { 
    color: COLORS.text 
  },
  homeOppLogoText: { 
    color: COLORS.grayLighter 
  },
  homeMatchupCity: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: COLORS.text, 
    textTransform: 'uppercase' 
  },
  homeMatchupSub: { 
    color: COLORS.textMuted, 
    fontSize: 11, 
    marginTop: 4, 
    fontWeight: '600' 
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
    fontWeight: '800', 
    color: COLORS.primary, 
    letterSpacing: 0.5 
  },
  homeVsContainer: { 
    width: 40, 
    alignItems: 'center' 
  },
  homeVsText: { 
    color: COLORS.grayLighter, 
    fontWeight: '900', 
    fontSize: 16 
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
    fontWeight: '800', 
    letterSpacing: 1 
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
    fontWeight: '800' 
  },
  homeSeriesScoreContainer: { 
    alignItems: 'center' 
  },
  homeSeriesLabel: { 
    color: COLORS.textSub, 
    fontSize: 9, 
    fontWeight: '900', 
    letterSpacing: 1.5, 
    marginBottom: 8 
  },
  homeSeriesScoreText: { 
    color: COLORS.text, 
    fontSize: 32, 
    fontWeight: '900', 
    letterSpacing: 10 
  },
  homeSeriesSubText: { 
    color: COLORS.textMuted, 
    fontSize: 10, 
    fontWeight: '700', 
    marginTop: 8 
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
    fontWeight: '900', 
    color: COLORS.text, 
    textAlign: 'center' 
  },
  homeEndSeasonSub: { 
    fontSize: 14, 
    color: COLORS.textMuted, 
    textAlign: 'center', 
    marginTop: 10, 
    lineHeight: 20 
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
    fontWeight: '900', 
    fontSize: 16, 
    letterSpacing: 1 
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
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
  },

  // --- QUICK SIM SCREEN ---
  qsScrollContent: { paddingBottom: 40 },
  qsHeaderRow: { padding: 15, paddingBottom: 0 },
  qsBackBtn: { padding: 10, width: 60 },
  qsScoreBoard: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', padding: 20 },
  qsTeamSide: { alignItems: 'center', flex: 1 },
  qsLogoPlaceholder: { fontSize: 40, color: COLORS.white, fontWeight: '900', backgroundColor: COLORS.grayLight, width: 80, height: 80, textAlign: 'center', lineHeight: 80, borderRadius: 40, marginBottom: 10 },
  qsLogoImage: { width: 80, height: 80, marginBottom: 10, resizeMode: 'contain' },
  qsCityName: { color: COLORS.textSub, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  qsScore: { color: COLORS.text, fontSize: 54, fontWeight: '900', marginTop: 10 },
  qsVs: { color: COLORS.border, fontWeight: '900', fontSize: 18 },
  qsWinner: { color: COLORS.success },
  qsOtBadge: { alignSelf: 'center', backgroundColor: COLORS.accent, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, marginBottom: 10 },
  qsOtText: { color: COLORS.black, fontWeight: '900', fontSize: 11 },
  qsPostGame: { marginTop: 10, paddingHorizontal: 20 },
  qsWinnerTerracotta: { color: '#B34726' },
  qsContinueButtonTerracotta: { backgroundColor: '#B34726', padding: 18, borderRadius: 12, alignItems: 'center' },
  qsContinueTextBlack: { fontWeight: '900', fontSize: 16, color: COLORS.black },

  // --- STANDINGS SCREEN ---
  stHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  stTitle: { fontSize: 18, fontWeight: '900', letterSpacing: 1, color: COLORS.white },
  stTabBar: { flexDirection: 'row', borderBottomWidth: 1, borderColor: COLORS.border },
  stTab: { flex: 1, padding: 15, alignItems: 'center' },
  stActiveTab: { borderBottomWidth: 3, borderColor: COLORS.primary },
  stTabText: { color: COLORS.textMuted, fontWeight: 'bold' },
  stActiveTabText: { color: COLORS.white },
  stTableHeader: { flexDirection: 'row', padding: 15, backgroundColor: COLORS.card, borderBottomWidth: 1, borderColor: COLORS.border },
  stHeaderRank: { width: 30, fontSize: 10, color: COLORS.textMuted, fontWeight: 'bold' },
  stHeaderTeam: { flex: 1, fontSize: 10, color: COLORS.textMuted, fontWeight: 'bold' },
  stRecordColsHeader: { flexDirection: 'row', width: 60, justifyContent: 'space-between' },
  stHeaderStat: { fontSize: 10, color: COLORS.textMuted, fontWeight: 'bold', width: 25, textAlign: 'center' },
  stTeamRow: { flexDirection: 'row', padding: 15, alignItems: 'center', borderBottomWidth: 1, borderColor: COLORS.border },
  stUserRow: { backgroundColor: COLORS.grayLight },
  stRankText: { width: 30, fontWeight: 'bold', color: COLORS.textSub },
  stLogoImage: { width: 20, height: 20, marginRight: 8, resizeMode: 'contain' },
  stCityName: { flex: 1, fontWeight: '600', fontSize: 16, color: COLORS.text },
  stRecordCols: { flexDirection: 'row', width: 60, justifyContent: 'space-between' },
  stRecordText: { width: 25, textAlign: 'center', fontWeight: 'bold', color: COLORS.text },

  // --- DRAFT SCREEN ---
  drHeader: { padding: 20, alignItems: 'center', backgroundColor: COLORS.darkBg },
  drHeaderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 15 },
  drTitle: { color: COLORS.white, fontSize: 12, fontWeight: '900', letterSpacing: 4, marginBottom: 0 },
  drTeamViewBtn: { backgroundColor: COLORS.secondary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, borderWidth: 1, borderColor: COLORS.border },
  drTeamViewBtnText: { color: COLORS.textSub, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  drOnClockCard: { alignItems: 'center' },
  drOnClockLabel: { color: COLORS.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  drOnClockTeam: { color: COLORS.white, fontSize: 24, fontWeight: '900', marginVertical: 4 },
  drPickNumber: { color: COLORS.textSub, fontSize: 12, fontWeight: 'bold' },
  drSimBtn: { backgroundColor: COLORS.secondary, margin: 15, padding: 12, borderRadius: 8, alignItems: 'center' },
  drSimBtnText: { color: COLORS.white, fontWeight: '900', fontSize: 12, letterSpacing: 1 },
  drListContainer: { paddingHorizontal: 15, paddingBottom: 20 },
  drListHeader: { fontSize: 12, fontWeight: '900', color: COLORS.textMuted, marginVertical: 15, letterSpacing: 1 },
  drPlayerCard: { flexDirection: 'row', backgroundColor: COLORS.card, padding: 15, borderRadius: 12, marginBottom: 10, alignItems: 'center', elevation: 2 },
  drPlayerInfo: { flex: 1 },
  drPlayerName: { fontSize: 18, fontWeight: '900', color: COLORS.text },
  drPlayerSub: { color: COLORS.textMuted, fontWeight: 'bold', fontSize: 12, marginTop: 2 },
  drRatingBox: { alignItems: 'center', marginRight: 15 },
  drRatingVal: { fontSize: 20, fontWeight: '900', color: COLORS.primary },
  drRatingLabel: { fontSize: 8, color: COLORS.textSub, fontWeight: 'bold' },
  drPickBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  drPickBtnText: { color: COLORS.white, fontWeight: '900', fontSize: 12 },
  drSummaryRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, padding: 12, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  drUserSummaryRow: { borderColor: COLORS.primary, backgroundColor: COLORS.grayLight },
  drSummaryPick: { width: 40, fontSize: 12, fontWeight: '900', color: COLORS.textMuted },
  drLogoImage: { width: 20, height: 20, marginRight: 8, resizeMode: 'contain' },
  drSummaryInfo: { flex: 1 },
  drSummaryTeam: { fontSize: 10, fontWeight: '900', color: COLORS.primary },
  drUserSummaryText: { color: COLORS.secondary },
  drSummaryPlayer: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  drSummaryRating: { alignItems: 'center' },
  drSummaryRatingVal: { fontSize: 14, fontWeight: '900', color: COLORS.text },
  drSummaryRatingLabel: { fontSize: 7, fontWeight: 'bold', color: COLORS.textSub },
  drStartSeasonBtn: { backgroundColor: COLORS.secondary, margin: 20, padding: 18, borderRadius: 12, alignItems: 'center' },
  drStartSeasonBtnText: { color: COLORS.white, fontWeight: '900', fontSize: 14, letterSpacing: 1 },

  // --- TEAM OVERVIEW SCREEN ---
  tosHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 10 },
  tosBackBtn: { width: 60 },
  tosTitle: { color: COLORS.white, fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  tosContainer: { flex: 1, paddingHorizontal: 15 },
  tosTrophySection: { alignItems: 'center', backgroundColor: COLORS.darkBg, padding: 20, borderRadius: 15, marginVertical: 15 },
  tosTrophyIcon: { fontSize: 32 },
  tosTrophyCount: { color: COLORS.white, fontSize: 24, fontWeight: '900', marginTop: 5 },
  tosTrophyLabel: { color: COLORS.textSub, fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  tosTeamRatingsRow: { flexDirection: 'row', justifyContent: 'center', gap: 40, marginBottom: 25, backgroundColor: COLORS.background, padding: 15, borderRadius: 12 },
  tosTeamRatingBox: { alignItems: 'center' },
  tosTeamRatingVal: { fontSize: 22, fontWeight: '900', color: COLORS.white },
  tosTeamOvrVal: { color: COLORS.primary },
  tosTeamRatingLabel: { fontSize: 9, color: COLORS.textMuted, fontWeight: '800', marginTop: 2 },
  tosSectionHeader: { color: COLORS.textSub, fontSize: 12, fontWeight: '900', letterSpacing: 2, marginBottom: 10, marginLeft: 5 },
  tosPlayerCard: { backgroundColor: COLORS.card, borderRadius: 12, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, elevation: 2 },
  tosPlayerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  tosPlayerMain: { fontSize: 18, fontWeight: '900', color: COLORS.text },
  tosPlayerNum: { color: COLORS.accent, fontSize: 14 },
  tosPlayerPos: { color: COLORS.textMuted, fontWeight: 'bold', fontSize: 12 },
  tosRatingsRow: { flexDirection: 'row', gap: 15 },
  tosRatingItem: { alignItems: 'center' },
  tosRatingVal: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  tosOvrVal: { color: COLORS.primary },
  tosRatingLabel: { fontSize: 8, color: COLORS.textSub, fontWeight: 'bold' },
  tosRookieBadge: { backgroundColor: '#F6AD55', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  tosRookieBadgeText: { color: COLORS.white, fontSize: 8, fontWeight: '900', letterSpacing: 0.5 },

  // --- TEAM OVERVIEW (PREVIEW) ---
  toHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginVertical: 15 },
  toBackBtn: { padding: 10, width: 60 },
  toHeaderText: { fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center', color: COLORS.white },
  toTeamStatsRow: { flexDirection: 'row', justifyContent: 'center', gap: 30, marginBottom: 20 },
  toStatBox: { alignItems: 'center' },
  toStatVal: { fontSize: 24, fontWeight: 'bold', color: COLORS.white },
  toStatLabel: { fontSize: 10, color: COLORS.textSub },
  toPlayerCard: { flexDirection: 'row', padding: 15, borderBottomWidth: 1, borderBottomColor: COLORS.border, alignItems: 'center' },
  toPlayerPos: { width: 40, fontWeight: 'bold', color: COLORS.textSub },
  toPlayerName: { flex: 1, fontSize: 16, color: COLORS.text },
  toPlayerOvr: { fontWeight: 'bold', fontSize: 16, color: COLORS.text },
  toSectionHeader: { backgroundColor: COLORS.card, padding: 10, paddingHorizontal: 15 },
  toSectionHeaderText: { fontSize: 12, fontWeight: 'bold', color: COLORS.textSub, letterSpacing: 1 },
  toConfirmBtn: { backgroundColor: COLORS.primary, margin: 20, padding: 15, borderRadius: 10, alignItems: 'center' },
  toConfirmBtnText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
  toConfirmBtnTextBlack: { color: COLORS.black, fontWeight: 'bold', fontSize: 16 },

  // --- HISTORY SCREEN ---
  hiHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  hiHeaderBack: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  hiHeaderTitle: { color: COLORS.white, fontSize: 18, fontWeight: '900', letterSpacing: 2 },
  hiScrollContent: { padding: 15 },
  hiHistoryCard: { backgroundColor: COLORS.card, borderRadius: 16, marginBottom: 15, padding: 20, borderWidth: 1, borderColor: COLORS.border },
  hiCardHeader: { flexDirection: 'column' },
  hiYearText: { color: COLORS.accent, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  hiLogoImage: { width: 18, height: 18, marginRight: 6, resizeMode: 'contain' },
  hiChampRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  hiChampText: { color: COLORS.white, fontSize: 20, fontWeight: '900', flex: 1, flexShrink: 1 },
  hiChampStats: { alignItems: 'flex-end', minWidth: 50 },
  hiChampStatText: { color: COLORS.primary, fontSize: 10, fontWeight: '900' },
  hiUserSummary: { flexDirection: 'row', gap: 10, marginTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12, alignItems: 'center' },
  hiUserLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  hiUserStat: { color: COLORS.textSub, fontSize: 13, fontWeight: 'bold' },
  hiEmptyContainer: { padding: 40, alignItems: 'center' },
  hiEmptyText: { color: COLORS.textMuted, fontSize: 16, fontWeight: 'bold', textAlign: 'center' },

  // --- PLAYOFF BRACKET SCREEN ---
  pbHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  pbTitle: { fontSize: 18, fontWeight: '900', color: COLORS.white },
  pbContent: { padding: 16 },
  pbConferenceSection: { marginBottom: 20 },
  pbConferenceHeader: { fontSize: 12, fontWeight: '900', color: COLORS.textSub, letterSpacing: 1.5, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 4 },
  pbSeriesCard: { backgroundColor: COLORS.card, borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2 },
  pbTeamRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6, alignItems: 'center' },
  pbTeamInfo: { flexDirection: 'row', alignItems: 'center' },
  pbRankLabel: { fontSize: 12, color: COLORS.textSub, fontWeight: 'bold', width: 22, textAlign: 'left' },
  pbLogoImage: { width: 20, height: 20, marginRight: 8, resizeMode: 'contain' },
  pbTeamName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  pbWinner: { color: COLORS.primary },
  pbScore: { fontSize: 16, fontWeight: '900', color: COLORS.text },
  pbSimDayBtn: { backgroundColor: COLORS.secondary, margin: 20, padding: 18, borderRadius: 12, alignItems: 'center' },
  pbNextSeasonBtn: { backgroundColor: COLORS.success },
  pbSimDayBtnText: { color: COLORS.white, fontWeight: 'bold' },
  pbChampContainer: { alignItems: 'center', marginTop: 20, padding: 20 },
  pbChampText: { fontSize: 20, fontWeight: '900', color: COLORS.white },

  // --- FULL PLAYOFF BRACKET SCREEN ---
  fpbRoundContainer: { marginBottom: 30 },
  fpbRoundTitle: { color: COLORS.textSub, fontSize: 14, fontWeight: '900', letterSpacing: 2, marginBottom: 15, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: 5 },

  // --- TEAM SELECTION SCREEN ---
  tsHeader: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginVertical: 20, flex: 1, color: COLORS.white },
  tsHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15 },
  tsBackBtn: { padding: 10, width: 60 },
  tsListContent: { paddingHorizontal: 10 },

  // --- TEAM CARD COMPONENT ---
  tcCard: { flex: 1, alignItems: 'center', margin: 8, paddingVertical: 10 },
  tcLogoCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.grayLight, justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
  tcLogoLetter: { fontSize: 24, fontWeight: '600', color: COLORS.text },
  tcLogoImage: { width: 40, height: 40, resizeMode: 'contain' },
  tcCityText: { fontSize: 12, textAlign: 'center', color: COLORS.text },

  // --- DRAFT LOTTERY SCREEN ---
  dlHeader: { padding: 20, alignItems: 'center' },
  dlTitle: { color: COLORS.primary, fontSize: 28, fontWeight: '900', letterSpacing: 2 },
  dlSubtitle: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700', marginTop: 5 },
  dlRevealContainer: { height: 280, justifyContent: 'center', alignItems: 'center', padding: 20 },
  dlBeginBtn: { backgroundColor: '#B34726', marginHorizontal: 20, marginVertical: 20, padding: 20, borderRadius: 16, alignItems: 'center', elevation: 8 },
  dlBeginBtnText: { color: COLORS.black, fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  dlActiveReveal: { alignItems: 'center', width: '100%' },
  dlPickLabel: { color: COLORS.textMuted, fontSize: 18, fontWeight: '900', marginBottom: 10 },
  dlCityCard: { backgroundColor: COLORS.card, width: '100%', padding: 30, borderRadius: 20, alignItems: 'center', borderWidth: 2, borderColor: COLORS.border, marginBottom: 10 },
  dlLogoImage: { width: 100, height: 100, marginBottom: 20, resizeMode: 'contain' },
  dlCityName: { color: COLORS.white, fontSize: 32, fontWeight: '900', textAlign: 'center' },
  dlRankLabel: { color: COLORS.textSub, fontSize: 12, fontWeight: '700', marginTop: 10 },
  dlSummaryList: { padding: 15 },
  dlSummaryItem: { flexDirection: 'row', backgroundColor: COLORS.card, marginBottom: 8, padding: 15, borderRadius: 12, alignItems: 'center', opacity: 0.3 },
  dlRevealedItem: { opacity: 1, borderColor: COLORS.border, borderWidth: 1 },
  dlSummaryPick: { color: COLORS.primary, fontWeight: '900', width: 40, fontSize: 16 },
  dlSummaryLogoImage: { width: 24, height: 24, marginRight: 10, resizeMode: 'contain' },
  dlSummaryCity: { color: COLORS.white, fontWeight: '800', flex: 1, fontSize: 16 },
  dlSummaryProj: { color: COLORS.textSub, fontSize: 12, fontWeight: 'bold' },
  dlProjectedList: { flex: 1, paddingHorizontal: 20 },
  dlProjectedRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, alignItems: 'center' },
  dlProjectedCity: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  dlProjectedSub: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600', marginTop: 2 },
  dlProjectedPick: { color: COLORS.primary, fontSize: 16, fontWeight: '900' },
});
