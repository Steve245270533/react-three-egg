/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.1.4 -T fella-anim.glb
*/

import { useMemo, useRef, FC } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { GroupProps, useFrame, useGraph } from "@react-three/fiber";
import { Vector3 } from "three";
import { vec3 } from "@react-three/rapier";
import { SkeletonUtils } from "three-stdlib";
import {MODEL_BASE_URL} from "@/Constants.ts";

const MODEL_URL = MODEL_BASE_URL + "fella-anim-transformed.glb"

export const CharacterModel: FC<GroupProps & {
  state: {
    moving: boolean;
    velocity: Vector3;
  }
}> = ({
  state,
  ...props
}) => {
  const group = useRef();
  const { materials, animations, scene } = useGLTF(MODEL_URL);
  // Skinned meshes cannot be re-used in threejs without cloning them
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  // useGraph creates two flat object collections for nodes and materials
  const { nodes } = useGraph(clone);

  const { actions } = useAnimations(animations, group);
  const animState = useRef({
    currentAnimation: "",
    direction: null
  });

  useFrame(() => {
    try {
      const { currentAnimation } = animState.current;
      const animation = state.moving ? "run" : "idle";

      if (currentAnimation !== animation) {
        actions[currentAnimation]?.fadeOut(0.1);
        actions[animation]?.reset().play().fadeIn(0.1);
        animState.current.currentAnimation = animation;
      }

      if (state.velocity && state.moving) {
        const oldQuat = group.current.quaternion.clone();
        group.current.lookAt(
          group.current.getWorldPosition(vec3()).add(state.velocity)
        );
        const newQuat = group.current.quaternion.clone();

        animState.current.direction = oldQuat.clone().slerp(newQuat, 0.1);
        group.current.quaternion.copy(animState.current.direction);
      }
    } catch (err) {}
  });

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Armature" rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
        <primitive object={nodes.mixamorigHips} />
        <skinnedMesh
          name="body"
          geometry={nodes.body.geometry}
          material={materials["Material.001"]}
          skeleton={nodes.body.skeleton}
          castShadow
        />
        <skinnedMesh
          name="eyel"
          geometry={nodes.eyel.geometry}
          material={materials.eye}
          skeleton={nodes.eyel.skeleton}
        />
        <skinnedMesh
          name="eyer"
          geometry={nodes.eyer.geometry}
          material={materials.eye}
          skeleton={nodes.eyer.skeleton}
        />
        <skinnedMesh
          name="mouth"
          geometry={nodes.mouth.geometry}
          material={materials.eye}
          skeleton={nodes.mouth.skeleton}
        />
      </group>
    </group>
  );
};

useGLTF.preload(MODEL_URL);
