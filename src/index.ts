import Quagga from '@ericblade/quagga2';
import {
    AnyAction,
    Dispatch,
    Middleware,
    MiddlewareAPI
} from 'redux';
import { action as createAction, payload as withPayload } from 'ts-action';

export const ActionTypes = {
    CAMERA_NO_PERMISSION: '@quagga2/cameraNoPermission',
    CAMERA_PERMISSION_SUCCESSFUL: '@quagga2/cameraPermissionSuccessful',
    ENUMERATE_VIDEO_DEVICES: '@quagga2/enumerateVideoDevices',
    RECEIVE_VIDEO_DEVICES: '@quagga2/receiveVideoDevices',
    REQUEST_PERMISSION: '@quagga2/requestCameraPermission',
} as const;

export type VideoDevices = Array<MediaDeviceInfo>;

export const receiveVideoDevices = createAction(
    ActionTypes.RECEIVE_VIDEO_DEVICES,
    withPayload<VideoDevices>(),
);
export const enumerateVideoDevices = createAction(ActionTypes.ENUMERATE_VIDEO_DEVICES);
export const requestCameraPermission = createAction(ActionTypes.REQUEST_PERMISSION);
export const cameraNoPermission = createAction(ActionTypes.CAMERA_NO_PERMISSION);
export const cameraPermissionSuccessful = createAction(ActionTypes.CAMERA_PERMISSION_SUCCESSFUL);

async function doCameraEnumeration(dispatch: Dispatch) {
    const { CameraAccess } = Quagga;
    const videoDevices = await CameraAccess.enumerateVideoDevices();
    dispatch(receiveVideoDevices(videoDevices));
}

async function doCameraPermissionRequest(dispatch: Dispatch) {
    const { CameraAccess } = Quagga;
    try {
        await CameraAccess.request(null, {});
        await CameraAccess.release();
        dispatch(cameraPermissionSuccessful());
    } catch (e) {
        dispatch(cameraNoPermission());
    }
}

// eslint-disable-next-line max-len
const middleware: Middleware<Dispatch> = ({ dispatch }: MiddlewareAPI) => (next) => async (action: AnyAction) => {
    switch (action.type) {
        case ActionTypes.REQUEST_PERMISSION:
            doCameraPermissionRequest(dispatch);
            break;
        case ActionTypes.ENUMERATE_VIDEO_DEVICES:
            doCameraEnumeration(dispatch);
            break;
        default:
            break;
    }
    next(action);
};

export default middleware;
