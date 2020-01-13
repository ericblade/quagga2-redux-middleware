import Quagga from '@ericblade/quagga2';
import {
    MiddlewareAPI,
    Dispatch,
    Middleware,
    AnyAction,
} from 'redux';
import { action as createAction, payload as withPayload } from 'ts-action';

export const Actions = {
    RECEIVE_VIDEO_DEVICES: 'RECEIVE_VIDEO_DEVICES',
    ENUMERATE_VIDEO_DEVICES: 'ENUMERATE_VIDEO_DEVICES',
} as const;

export type VideoDevices = Array<MediaDeviceInfo>;

export const receiveVideoDevices = createAction(
    Actions.RECEIVE_VIDEO_DEVICES,
    withPayload<VideoDevices>(),
);
export const enumerateVideoDevices = createAction(Actions.ENUMERATE_VIDEO_DEVICES);

async function doCameraEnumeration(dispatch: Dispatch) {
    const { CameraAccess } = Quagga;
    const videoDevices = await CameraAccess.enumerateVideoDevices();
    dispatch(receiveVideoDevices(videoDevices));
}

// eslint-disable-next-line max-len
const middleware: Middleware<Dispatch> = ({ dispatch }: MiddlewareAPI) => (next) => async (action: AnyAction) => {
    switch (action.type) {
        case Actions.ENUMERATE_VIDEO_DEVICES:
            doCameraEnumeration(dispatch);
            next(action);
            break;
        default:
            next(action);
            break;
    }
};

export default middleware;
