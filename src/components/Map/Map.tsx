import {RefObject, useMemo, useRef, FC} from "react";
import {Mesh} from "three";
import {useMap} from "@/hooks/useMap.ts";
import {
	euler,
	quat,
	RapierRigidBody,
	RigidBody,
	useBeforePhysicsStep,
	useRevoluteJoint,
	vec3
} from "@react-three/rapier";
import {Vector3} from "@react-three/fiber";

const RevolverJoint: FC<{
	body: RefObject<RapierRigidBody>;
	position: Vector3;
}> = ({
   body,
   position
}) => {
	const anchor = useRef<RapierRigidBody>(null);

	useRevoluteJoint(anchor, body, [
		[0, 0, 0],
		[0, 0, 0],
		[0, 1, 0]
	]);

	return <RigidBody ref={anchor} position={position} />;
};

const MapNode: FC<{ node: Mesh }> = ({ node }) => {
	const body = useRef<RapierRigidBody>(null);
	const rand = useRef(Math.random());

	useBeforePhysicsStep(() => {
		try {
			if (node.userData.obstacle === "swing") {
				const now = performance.now();

				body.current?.setNextKinematicRotation(
					quat().setFromEuler(
						euler({
							x: 0,
							y: 0,
							z: Math.sin((now + rand.current * 2000) / 1000)
						})
					)
				);
			}

			if (node.userData.obstacle === "slider") {
				const now = performance.now();

				body.current!.setNextKinematicTranslation(
					vec3({
						x: Math.sin((now + rand.current * 800) / 700) * 6,
						y: node.position.y,
						z: node.position.z
					})
				);
			}
		} catch (err) {}
	});

	if (node.userData.obstacle === "revolver") {
		return (
			<>
				<RigidBody
					ref={body}
					colliders={"trimesh"}
					position={node.position}
					rotation={node.rotation}
				>
					<primitive
						object={node.clone(true)}
						position={[0, 0, 0]}
						rotation={[0, 0, 0]}
						receiveShadow
						castShadow
					/>
				</RigidBody>
				<RevolverJoint body={body} position={node.position} />
			</>
		);
	}

	if (node.userData.obstacle === "swing") {
		return (
			<>
				<RigidBody
					ref={body}
					type={"kinematicPosition"}
					colliders={"trimesh"}
					position={node.position}
					rotation={node.rotation}
				>
					<primitive
						object={node.clone(true)}
						position={[0, 0, 0]}
						rotation={[0, 0, 0]}
						receiveShadow
						castShadow
					/>
				</RigidBody>
			</>
		);
	}

	if (node.userData.obstacle === "slider") {
		return (
			<>
				<RigidBody
					ref={body}
					type={"kinematicPosition"}
					colliders={"trimesh"}
					position={node.position}
					rotation={node.rotation}
				>
					<primitive
						object={node.clone(true)}
						position={[0, 0, 0]}
						rotation={[0, 0, 0]}
						receiveShadow
						castShadow
					/>
				</RigidBody>
			</>
		);
	}

	if (node.userData.physics) {
		return (
			<RigidBody
				ref={body}
				type={node.userData.type}
				colliders={node.userData.physics}
				position={node.position}
				rotation={node.rotation}
			>
				<primitive
					object={node.clone(true)}
					position={[0, 0, 0]}
					rotation={[0, 0, 0]}
					receiveShadow
					castShadow
				/>
			</RigidBody>
		);
	}

	if (node.name === "x_goal") {
		return (
			<RigidBody
				sensor
				includeInvisible
				type="fixed"
				position={node.position}
				rotation={node.rotation}
				onIntersectionEnter={(ctx) => {
					const e = new Event("game:goal-entered");
					e.detail = ctx;
					window.dispatchEvent(e);
				}}
			>
				<primitive
					object={node.clone(true)}
					position={[0, 0, 0]}
					rotation={[0, 0, 0]}
					visible={false}
				/>
			</RigidBody>
		);
	}

	if (node.name === "Scene" || node.name.includes("x_")) return null;

	return <primitive object={node} receiveShadow castShadow />;
};

const Map = () => {
	const map = useMap();

	const nodes = useMemo(() => {
		return Object.values(map.nodes) as Mesh[];
	}, [map]);

	return (
		<>
			{nodes.map((node) => (
				<MapNode node={node} key={node.uuid} />
			))}
		</>
	);
};

export default Map;
