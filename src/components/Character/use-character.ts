import { useThree } from "@react-three/fiber";
import {
  RapierRigidBody,
  useBeforePhysicsStep,
  useRapier,
  vec3
} from "@react-three/rapier";
import { RefObject, useEffect, useRef } from "react";
import { Ray } from "@dimforge/rapier3d-compat";

const useKeyboard = () => {
  const keysDown = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keysDown.current[event.key] = true;
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      keysDown.current[event.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return keysDown;
};

const ray = new Ray(vec3(), vec3({ x: 0, y: -1, z: 0 }));

export const useCharacterState = () =>
  useRef({
    grounded: false,
    velocity: vec3(),
    moving: false,
    jumping: false
  }).current;

export const useCharacterController = (
  bodyRef: RefObject<RapierRigidBody>,
  {
    maxSpeed = 0.05
  }: {
    maxSpeed: number;
  }
) => {
  const rapier = useRapier();
  const { camera } = useThree();

  const keysdown = useKeyboard();

  const characterState = useCharacterState();

  useEffect(() => {
    camera.near = 0.01;
    camera.far = 100;
  }, []);

  const lastTick = useRef(0);

  useBeforePhysicsStep(() => {
    const body = bodyRef.current;
    const now = performance.now();
    const delta = (now - lastTick.current) / 1000;
    lastTick.current = now;

    if (body) {
      try {
        const linvel = vec3(body.linvel());
        const movement = vec3();
        const translation = vec3(body.translation());

        if (keysdown.current.ArrowUp && linvel.z > -maxSpeed) {
          movement.z = Math.max(-maxSpeed - linvel.z, -maxSpeed);
        }
        if (keysdown.current.ArrowDown && linvel.z < maxSpeed) {
          movement.z = Math.min(maxSpeed - linvel.z, maxSpeed);
        }
        if (keysdown.current.ArrowLeft && linvel.x > -maxSpeed) {
          movement.x = Math.max(-maxSpeed - linvel.x, -maxSpeed);
        }
        if (keysdown.current.ArrowRight && linvel.x < maxSpeed) {
          movement.x = Math.min(maxSpeed - linvel.x, maxSpeed);
        }

        const mult = delta / (1 / 60);
        movement.multiply({ x: mult, y: mult, z: mult });

        const finalTranslation = translation.add(movement);

        body.setTranslation(finalTranslation, true);

        if (ray) {
          ray.origin = finalTranslation.add(vec3({ x: 0, y: -0.25, z: 0 }));
          const intersection = rapier.world.castRay(ray, 0.01, true);

          if (intersection?.collider) {
            characterState.grounded = true;
          } else {
            characterState.grounded = false;
          }
        }

        if (
          characterState.grounded &&
          keysdown.current[" "] &&
          !characterState.jumping
        ) {
          body.setLinvel(linvel.add({ x: 0, y: 5, z: 0 }), true);
          characterState.jumping = true;
          setTimeout(() => (characterState.jumping = false), 100);
        }

        characterState.velocity = movement;
        characterState.moving = characterState.velocity.length() > 0.01;
      } catch (err) {}
    }
  });

  return characterState;
};
