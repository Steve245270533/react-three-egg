import {useEffect, useRef} from "react";
import {CapsuleCollider, RapierRigidBody, RigidBody, useAfterPhysicsStep, vec3} from "@react-three/rapier";
import {DirectionalLight, Mesh, Object3D} from "three";
import {useThree} from "@react-three/fiber";
import {Capsule} from "@react-three/drei";
import {CharacterModel} from "./CharacterModel.tsx";
import {useMap} from "@/hooks/useMap.ts";
import {useCharacterController} from "@/components/Character/use-character.ts";

const Character = () => {
	const map = useMap();
	const body = useRef<RapierRigidBody>(null);
	const state = useCharacterController(body, {
		maxSpeed: 0.1
	});

	const capsule = useRef<Mesh>();

	const { camera } = useThree();
	const cameraTarget = useRef<Object3D>();

	const resetCharacter = () => {
		body.current?.setLinvel(vec3());
		body.current.setTranslation(map.nodes.x_player_spawn.position);
	};

	useEffect(() => {
		camera.far = 100000;

		const handleGoal = (evt) => {
			if (evt.detail.rigidBody.userData.character) {
				resetCharacter();
			}
		};
		window.addEventListener("game:goal-entered", handleGoal);

		return () => {
			window.removeEventListener("game:goal-entered", handleGoal);
		};
	}, []);

	const light = useRef<DirectionalLight>(null);
	const shadowTarget = useRef();

	useAfterPhysicsStep(() => {
		try {
			const pos = vec3(capsule.current!.getWorldPosition(vec3()));

			camera.position.lerp(vec3(pos).add({ x: 0, y: 4, z: 6 }), 0.03);
			cameraTarget.current!.position.lerp(pos, 0.1);
			camera.lookAt(cameraTarget.current!.position);

			shadowTarget.current.position.copy(pos);
			light.current!.position.copy(vec3(pos).add({ x: -20, y: 20, z: -20 }));
			light.current!.target = shadowTarget.current;

			if (body.current.translation().y < -5) {
				resetCharacter();
			}
		} catch (err) {}
	});

	return (
		<>
			<object3D ref={cameraTarget} />
			<object3D ref={shadowTarget} />
			<directionalLight
				ref={light}
				castShadow
				intensity={0.5}
				shadow-camera-top={50}
				shadow-camera-left={-50}
				shadow-camera-right={50}
				shadow-camera-bottom={-50}
				shadow-camera-size={2048}
				shadow-bias={-0.001}
			/>
			<RigidBody
				enabledRotations={[false, false, false]}
				colliders={false}
				ref={body}
				position={[0, 3, 0]}
				userData={{
					character: true
				}}
			>
				<CharacterModel state={state} />
				<Capsule ref={capsule} visible={false} args={[0.5, 2]} />
				<CapsuleCollider args={[0.5, 0.5]} position={[0, 1, 0]} />
			</RigidBody>
		</>
	);
};

export default Character;
