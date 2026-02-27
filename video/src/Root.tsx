import { Composition } from "remotion";
import { JATTeaser } from "./JATTeaser";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="JATTeaser"
        component={JATTeaser}
        durationInFrames={1350}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
