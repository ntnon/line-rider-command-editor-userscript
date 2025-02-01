import { FONT_SIZE_SETTING } from "./lib/settings-storage.types";

export const THEME = {
  dark: "#0D1321",
  midDark: "#7F838B",
  midLight: "#B7BBC0",
  light: "#FCFCFC",
} as const;

export const TEXT_SIZES = {
  S: {[FONT_SIZE_SETTING.SMALL]: "12px", [FONT_SIZE_SETTING.MEDIUM]: "14px", [FONT_SIZE_SETTING.LARGE]: "16px"},
  M: {[FONT_SIZE_SETTING.SMALL]: "18px", [FONT_SIZE_SETTING.MEDIUM]: "22px", [FONT_SIZE_SETTING.LARGE]: "24px"},
} as const;

export const GLOBAL_STYLES = {
  rowCenter: {
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center"
  },
  root: {
    backgroundColor: THEME.light,
    transition: "opacity 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
    border: "2px solid black",
    fontFamily: "Helvetica",
    fontWeight: "bold",
    left: "50px",
    opacity: 0,
    overflow: "hidden",
    padding: "10px",
    pointerEvents: "none",
    position: "fixed",
    top: "12.5px"
  },
  content: {
    alignItems: "center",
    display: "flex",
    height: "50vh",
    flexDirection: "column",
    justifyContent: "center",
    paddingTop: "10px",
    width: "37.5vw"
  },
  toolbarContainer: {
    alignItems: "start",
    display: "flex",
    flex: 1,
    width: "100%"
  },
  tabContainer: {
    alignItems: "end",
    display: "flex",
    justifyContent: "start",
    flexDirection: "row",
    overflowX: "auto",
    width: "100%"
  },
  tab: {
    border: "2px solid black",
    borderBottom: "none",
    borderTopLeftRadius: "5px",
    borderTopRightRadius: "5px"
  },
  smoothContainer: {
    alignItems: "center",
    backgroundColor: THEME.light,
    borderBottom: "2px solid black",
    display: "flex",
    height: "30px",
    justifyContent: "start",
    padding: ".5em"
  },
  window: {
    backgroundColor: THEME.light,
    border: "2px solid black",
    display: "flex",
    flexDirection: "column",
    flex: 9,
    overflowY: "scroll",
    width: "100%"
  },
  triggerContainer: {
    alignItems: "start",
    backgroundColor: THEME.light,
    borderBottom: "2px solid black",
    display: "flex",
    flexDirection: "column",
    padding: "12px",
    position: "relative"
  },
  triggerActionContainer: {
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    direction: "ltr",
    justifyContent: "space-between",
    position: "absolute",
    right: "5px"
  },
  triggerPropContainer: {
    alignItems: "center",
    display: "flex",
    flexDirection: "row",
    justifyContent: "start",
    marginBottom: "0.25em",
    width: "100%",
    whiteSpace: "nowrap",
  },
  newTriggerButton: {
    backgroundColor: THEME.light,
    border: "2px solid black",
    borderRadius: "50%",
    bottom: "0px",
    left: "0px",
    marginLeft: "auto",
    marginRight: "auto",
    position: "absolute",
    right: "0px",
    transform: "translateY(50%)",
    zIndex: 1
  }
} satisfies Record<string, React.CSSProperties>;
