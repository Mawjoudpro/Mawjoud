import { AbsoluteFill } from "remotion";
import { colors, fontFamily } from "./theme";

// Écran provisoire : les scènes arrivent à l'étape 3 (animatic calé sur la voix).
export const GamobatiV3: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.night,
        color: colors.text,
        fontFamily,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ fontSize: 140, fontWeight: 800, letterSpacing: "-0.05em" }}>
        GAMOBATI
      </div>
      <div style={{ fontSize: 48, fontWeight: 450, color: colors.accent }}>
        V3 · animatic à venir
      </div>
    </AbsoluteFill>
  );
};
