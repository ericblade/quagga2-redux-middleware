import QuaggaMiddleware, { enumerateVideoDevices, ActionTypes } from '../../lib/index';
import { expect } from 'chai';
import { PayloadAction, Tuple, configureStore, createReducer } from '@reduxjs/toolkit';

let enumerateDone: undefined | Mocha.Done;
let receiveDone: undefined | Mocha.Done;
let receiveTestDone: undefined | Mocha.Done;

function isMediaDeviceInfoAction(action: any): action is PayloadAction<MediaDeviceInfo[]> {
    return action.payload !== undefined && action.payload !== null && action.payload.length > 0 && action.payload[0] instanceof MediaDeviceInfo && action.payload[0].kind === 'videoinput' && action.payload[0].label === 'fake_device_0';
}

const testReducer = createReducer({}, builder => {
    builder.addCase(ActionTypes.ENUMERATE_VIDEO_DEVICES, (state, action) => {
        expect(action).to.deep.equal({ type: ActionTypes.ENUMERATE_VIDEO_DEVICES, payload: undefined });
        enumerateDone?.();
        enumerateDone = undefined;
    });
    builder.addCase(ActionTypes.RECEIVE_VIDEO_DEVICES, (state, action) => {
        expect(isMediaDeviceInfoAction(action)).to.equal(true);
        receiveDone?.();
        receiveDone = undefined;
        receiveTestDone?.();
        receiveTestDone = undefined;
    });
});

const reducer = (state, action) => {
    switch (action.type) {
        case ActionTypes.ENUMERATE_VIDEO_DEVICES: {
            if (enumerateDone && enumerateDone !== null) {
                enumerateDone();
                enumerateDone = undefined;
            }
            break;
        }
        case ActionTypes.RECEIVE_VIDEO_DEVICES: {
            if (receiveDone && receiveDone !== null) {
                receiveDone();
                receiveDone = undefined;
            } else if (receiveTestDone && receiveTestDone !== null) {
                expect(action.payload).to.be.an('Array').with.lengthOf(1);
                expect(action.payload[0]).to.be.an.instanceOf(MediaDeviceInfo);
                expect(action.payload[0].kind).to.equal('videoinput');
                expect(action.payload[0].label).to.equal('fake_device_0');
                receiveTestDone();
                receiveTestDone = undefined;
            }
        }
    }
};

// const store = createStore(reducer, applyMiddleware(QuaggaMiddleware));
const store = configureStore({ reducer: testReducer, middleware: defaultMiddleware => new Tuple(QuaggaMiddleware) });

it('enumerateVideoDevices returns an action that equals Actions.ENUMERATE_VIDEO_DEVICES', () => {
    expect(enumerateVideoDevices()).to.deep.equal({ type: ActionTypes.ENUMERATE_VIDEO_DEVICES, payload: undefined });
});

it('enumerateVideoDevices dispatches Actions.ENUMERATE_VIDEO_DEVICES', (done) => {
    enumerateDone = done;
    store.dispatch(enumerateVideoDevices());
});

it('enumerateVideoDevices later dispatches Actions.RECEIVE_VIDEO_DEVICES', (done) => {
    receiveDone = done;
    store.dispatch(enumerateVideoDevices());
});

it('reducer receives expected results to RECEIVE_VIDEO_DEVICES', (done) => {
    receiveTestDone = done;
    store.dispatch(enumerateVideoDevices());
});

// TODO: devise a way to test the camera permission request?  it's a bit tricky, as it requires user interaction.
