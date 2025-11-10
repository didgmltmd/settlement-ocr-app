// components/ReceiptCamera.tsx
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  onCaptured: (uri: string) => void; // 촬영된 이미지 파일 URI 반환
};

export default function ReceiptCamera({ visible, onClose, onCaptured }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (!permission?.granted && visible) {
      requestPermission();
    }
  }, [visible]);

  const takePhoto = async () => {
    if (!cameraRef.current || isBusy) return;
    try {
      setIsBusy(true);
      const photo = await cameraRef.current.takePictureAsync({
        // iOS에서 고해상도 → 파일 크기 큼. OCR에 충분한 해상도만 확보
        quality: 0.9,
        skipProcessing: true,
      });

      // (선택) 파일 크기 줄이기 & 회전 보정
      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ rotate: 0 }], // EXIF 회전 보정이 문제될 때만
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      onCaptured(manipulated.uri);
      onClose();
    } catch (e) {
      console.warn(e);
    } finally {
      setIsBusy(false);
    }
  };

  if (!permission) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black">
        {permission.granted ? (
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing="back"
            enableTorch={false}
            // barcodeScannerSettings={{ barCodeTypes: [...] }} // 필요시 바코드 스캔도 가능
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-white mb-4">카메라 권한이 필요합니다.</Text>
            <Pressable
              onPress={requestPermission}
              className="px-4 py-2 bg-indigo-600 rounded-lg"
            >
              <Text className="text-white font-semibold">권한 요청</Text>
            </Pressable>
          </View>
        )}

        {/* 하단 컨트롤 바 */}
        <View className="absolute bottom-0 left-0 right-0 p-5 bg-black/50">
          <View className="flex-row justify-between">
            <Pressable
              onPress={onClose}
              className="px-4 py-3 rounded-xl bg-white/10"
            >
              <Text className="text-white">닫기</Text>
            </Pressable>

            <Pressable
              onPress={takePhoto}
              className="px-6 py-3 rounded-full bg-indigo-600"
            >
              <Text className="text-white font-semibold">
                {isBusy ? "처리중..." : "촬영"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
