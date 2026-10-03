import "@fontsource-variable/geist";
import { Composition } from "remotion";
import { GamobatiV3 } from "./GamobatiV3";

// Durée provisoire : elle sera calculée depuis voix/timestamps.json (étape 3).
const FPS = 30;
const DURATION_IN_FRAMES = 28 * FPS;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GamobatiV3"
        component={GamobatiV3}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="GamobatiV3-4x5"
        component={GamobatiV3}
        durationInFrames={DURATION_IN_FRAMES}
        fps={FPS}
        width={1080}
        height={1350}
      />
    </>
  );
};
