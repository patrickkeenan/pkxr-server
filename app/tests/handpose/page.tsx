"use client";
import { Suspense } from "react";
import { XRCanvas } from "@coconut-xr/natuerlich/defaults";
import { getInputSourceId } from "@coconut-xr/natuerlich";
import { useState } from "react";
import {
  useEnterXR,
  NonImmersiveCamera,
  ImmersiveSessionOrigin,
  useInputSources,
  useHandPoses,
  SessionModeGuard,
} from "@coconut-xr/natuerlich/react";
import { Environment, OrbitControls, Sphere } from "@react-three/drei";
import { RootContainer, Text } from "@coconut-xr/koestlich";

const sessionOptions: XRSessionInit = {
  requiredFeatures: ["local-floor", "hand-tracking"],
};

export function PoseHand({
  hand,
  inputSource,
  setPoseNames,
}: {
  hand: XRHand;
  inputSource: XRInputSource;
  setPoseNames: (names: string) => void;
}) {
  useHandPoses(
    hand,
    inputSource.handedness,
    (name, prevName) => {
      console.log(name, prevName);
      setPoseNames(`${name}, ${prevName}`);
    },
    {
      fist: "fist.handpose",
      relax: "relax.handpose",
      point: "point.handpose",
      shaka: "shaka.handpose",
      vulcan: "vulcan.handpose",
      flat: "flat.handpose",
      horns: "horns.handpose",
      peace: "peace.handpose",
      thumb: "thumb.handpose",
    }
  );

  return null;
}

export default function Index() {
  const enterAR = useEnterXR("immersive-ar", sessionOptions);
  const inputSources = useInputSources();
  const [leftPoseNames, setLeftPoseNames] = useState("none");
  const [rightPoseNames, setRightPoseNames] = useState("none");
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <button className={"button"} onClick={enterAR}>
        Enter AR
      </button>

      <XRCanvas>
        <group position={[0, 1.2, 3.5]}>
          <RootContainer anchorX="center" anchorY="center">
            <Text>{`Left: ${leftPoseNames}`}</Text>
            <Text>{`Right: ${rightPoseNames}`}</Text>
          </RootContainer>
        </group>
        <NonImmersiveCamera position={[0, 1.5, 4]} />
        <ImmersiveSessionOrigin position={[0, 0, 4]}>
          {inputSources.map((inputSource) =>
            inputSource.hand != null ? (
              <PoseHand
                setPoseNames={
                  inputSource.handedness === "left"
                    ? setLeftPoseNames
                    : setRightPoseNames
                }
                key={getInputSourceId(inputSource)}
                inputSource={inputSource}
                hand={inputSource.hand}
              />
            ) : null
          )}
        </ImmersiveSessionOrigin>
        <SessionModeGuard deny="immersive-ar">
          <Suspense>
            <Environment blur={0.05} files="/scenes/apartment.hdr" background />
          </Suspense>
        </SessionModeGuard>
      </XRCanvas>
    </div>
  );
}
