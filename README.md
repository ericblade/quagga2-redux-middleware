quagga2-redux-middleware
========================

[![Join the chat at
https://gitter.im/quaggaJS/Lobby](https://badges.gitter.im/quaggaJS/Lobby.svg)](https://gitter.im/quaggaJS/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

So, you want to use Quagga2 with Redux, perhaps in your React application?  This might help you out.

This README file will hopefully get more detailed as necessary, if necessary.

## What does it do?

This is a Redux middleware that provides an action that you can dispatch to asynchronously retrieve
a list of video camera devices potentially suitable for use with Quagga, and an action that you can
listen to in your reducers to store the device information.

### Installing

````npm install --save @ericblade/quagga2-redux-middleware````

### Adding the Middleware to your store

I'm going to be the first to admit that I'm not an expert in Redux middleware, but this is what
works for me:

````
store.js:

import { createStore, applyMiddleware, combineReducers } from 'redux';
import QuaggaMiddleware from '@ericblade/quagga2-redux-middleware';
... import / create all your reducers ...
const rootReducer = combineReducers({ uiReducer, dataReducer, settingsReducer }); // names here are just samples
const store = createStore(rootReducer, applyMiddleware(QuaggaMiddleware));
export store;

````

### Dispatching a request for video device information

If you're using react-redux, you should be able to do something a bit like

````
import { useDispatch } from 'react-redux';
import { enumerateVideoDevices } from '@ericblade/quagga2-redux-middleware';
...
const dispatch = useDispatch();
dispatch(enumerateVideoDevices());
````
You can also create your own middleware that dispatches (one or many) action(s) at application load/start.

### Receiving the video devices in your reducer

Personally, I store the camera information in a location that is not persisted between runs of my
application, in this case it's my "uiReducer".  The section responsible for storing this information
looks like:

````
import { Actions as CameraActions } from '@ericblade/quagga2-redux-middleware';
...
const uiReducer = (state = initialUiState, action) => {
    switch (action.type) {
        case CameraActions.RECEIVE_VIDEO_DEVICES:
            return { ...state, cameraList: action.payload };
        ....
    }
};

export default uiReducer;
````

Your reducer will receive an array of
[MediaDeviceInfo](https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo) objects, which is exported as type VideoDevices in this library.

In my project, I have a user-interface that allows the user to select a camera device based on it's
label, and then that passes the associated deviceId to Quagga2's init() function, as well as storing
the user's selection of deviceId into semi-permanent storage for re-use on the next application run.
