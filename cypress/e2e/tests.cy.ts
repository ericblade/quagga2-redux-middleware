import QuaggaMiddleware, { enumerateVideoDevices, ActionTypes } from '../../lib/index';
import { expect } from 'chai';
import { createStore, applyMiddleware } from 'redux';

let enumerateDone: undefined | Mocha.Done;
let receiveDone: undefined | Mocha.Done;
let receiveTestDone: undefined | Mocha.Done;

const reducer = (state, action) => {
    switch(action.type) {
        case ActionTypes.ENUMERATE_VIDEO_DEVICES: {
            if (enumerateDone && enumerateDone !== null) {
                enumerateDone();
                enumerateDone = null;
            }
            break;
        }
        case ActionTypes.RECEIVE_VIDEO_DEVICES: {
            if (receiveDone && receiveDone !== null) {
                receiveDone();
                receiveDone = null;
            } else if (receiveTestDone && receiveTestDone !== null) {
                expect(action.payload).to.be.an('Array').with.lengthOf(1);
                expect(action.payload[0]).to.be.an.instanceOf(MediaDeviceInfo);
                expect(action.payload[0].kind).to.equal('videoinput');
                expect(action.payload[0].label).to.equal('fake_device_0');
                receiveTestDone();
                receiveTestDone = null;
            }
        }
    }
};

const store = createStore(reducer, applyMiddleware(QuaggaMiddleware));

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
