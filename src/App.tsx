import {Environment} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {Physics} from "@react-three/rapier";
import {Suspense} from "react";
import "./styles.scss";
import Character from "@/components/Character/Character.tsx";
import Map from "@/components/Map/Map.tsx";
import Spinner from "@/components/Spinner/Spinner.tsx";

const Scene = () => {
  return (
    <group>
      <Character />
      <Map />
    </group>
  );
};

export default function App() {
  return (
    <div className="App">
      <Suspense fallback={<Spinner />}>
        <Canvas flat shadows dpr={1}>
          <Environment preset="dawn" />

          {/* debug为调试模式，会显示模型线框 */}
          <Physics timeStep={"vary"} debug={false}>
            <Scene />
          </Physics>
        </Canvas>
      </Suspense>
    </div>
  );
}
