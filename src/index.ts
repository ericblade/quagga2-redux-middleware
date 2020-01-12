import Quagga from '@ericblade/quagga2';
import { MiddlewareAPI, Dispatch, Middleware, AnyAction } from 'redux';
import { action, payload } from 'ts-action';

export const Actions = {
    RECEIVE_VIDEO_DEVICES: 'RECEIVE_VIDEO_DEVICES',
    ENUMERATE_VIDEO_DEVICES: 'ENUMERATE_VIDEO_DEVICES',
} as const;

export type VideoDevices = Array<MediaDeviceInfo>;

export const receiveVideoDevices = action(Actions.RECEIVE_VIDEO_DEVICES, payload<VideoDevices>());
export const enumerateVideoDevices = action(Actions.ENUMERATE_VIDEO_DEVICES);

function doCameraEnumeration(dispatch: Dispatch) {
    const { CameraAccess } = Quagga;
    CameraAccess.enumerateVideoDevices().then((devices) => dispatch(receiveVideoDevices(devices)));
}

const QuaggaMiddleware: Middleware<Dispatch> = ({ dispatch }: MiddlewareAPI) => (next) => async (action: AnyAction) => {
    switch (action.type) {
        case Actions.ENUMERATE_VIDEO_DEVICES:
            doCameraEnumeration(dispatch);
            next(action);
            break;
        default:
            next(action);
            break;
    }
}

export default QuaggaMiddleware;
