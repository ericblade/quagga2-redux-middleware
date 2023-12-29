import Quagga from '@ericblade/quagga2';
import {
    Dispatch,
    Middleware,
} from 'redux';
import { createAction } from '@reduxjs/toolkit';

export const ActionTypes = {
    CAMERA_NO_PERMISSION: '@quagga2/cameraNoPermission',
    CAMERA_PERMISSION_SUCCESSFUL: '@quagga2/cameraPermissionSuccessful',
    ENUMERATE_VIDEO_DEVICES: '@quagga2/enumerateVideoDevices',
    RECEIVE_VIDEO_DEVICES: '@quagga2/receiveVideoDevices',
    REQUEST_PERMISSION: '@quagga2/requestCameraPermission',
} as const;

export const receiveVideoDevices = createAction<MediaDeviceInfo[]>(ActionTypes.RECEIVE_VIDEO_DEVICES);
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

function isRequestPermissionAction(action: any): action is { type: typeof ActionTypes.REQUEST_PERMISSION } {
    return action.type === ActionTypes.REQUEST_PERMISSION;
}

function isEnumerateVideoDevicesAction(action: any): action is { type: typeof ActionTypes.ENUMERATE_VIDEO_DEVICES } {
    return action.type === ActionTypes.ENUMERATE_VIDEO_DEVICES;
}

const middleware: Middleware = api => next => action => {
    switch (true) {
        case isRequestPermissionAction(action):
            doCameraPermissionRequest(api.dispatch);
            break;
        case isEnumerateVideoDevicesAction(action):
            doCameraEnumeration(api.dispatch);
            break;
        default:
            break;
    }
    next(action);
};

export default middleware;
