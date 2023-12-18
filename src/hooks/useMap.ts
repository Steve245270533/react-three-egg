import {useGLTF} from "@react-three/drei";
import {MODEL_BASE_URL} from "@/Constants.ts";

const MODEL_URL = MODEL_BASE_URL + "trip-fellas-map-transformed.glb"

export const useMap = () => {
	return useGLTF(MODEL_URL);
};
