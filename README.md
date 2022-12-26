quagga2-redux-middleware
========================

[![Join the chat at
https://gitter.im/quaggaJS/Lobby](https://badges.gitter.im/quaggaJS/Lobby.svg)](https://gitter.im/quaggaJS/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

So, you want to use Quagga2 with Redux, perhaps in your React application?  This might help you out.

This README file will hopefully get more detailed as necessary, if necessary.

What does it do?
----------------

This is a Redux middleware that provides an action that you can dispatch to asynchronously retrieve
a list of video camera devices potentially suitable for use with Quagga, and an action that you can
listen to in your reducers to store the device information.

Installing
----------

````npm install --save @ericblade/quagga2-redux-middleware````

Adding the Middleware to your store
-----------------------------------

I'm going to be the first to admit that I'm not an expert in Redux middleware, but this is what
works for me:

````javascript
store.js:

import { createStore, applyMiddleware, combineReducers } from 'redux';
import QuaggaMiddleware from '@ericblade/quagga2-redux-middleware';
... import / create all your reducers ...
const rootReducer = combineReducers({ uiReducer, dataReducer, settingsReducer }); // names here are just samples
const store = createStore(rootReducer, applyMiddleware(QuaggaMiddleware));
export store;

````

Dispatching a request for video device information
--------------------------------------------------

If you're using react-redux, you should be able to do something a bit like

````javascript
import { useDispatch } from 'react-redux';
import { enumerateVideoDevices } from '@ericblade/quagga2-redux-middleware';
...
const dispatch = useDispatch();
dispatch(enumerateVideoDevices());
````

You can also create your own middleware that dispatches (one or many) action(s) at application load/start.

Receiving the video devices in your reducer
-------------------------------------------

Personally, I store the camera information in a location that is not persisted between runs of my
application, in this case it's my "uiReducer".  The section responsible for storing this information
looks like:

````javascript
import { ActionTypes as CameraActions } from '@ericblade/quagga2-redux-middleware';
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

or with redux-toolkit:

````javascript
const reducer = createReducer(initialUiState, builder => {
    builder.addCase(receiveVideoDevices, (state, { payload }) => { state.cameraList = payload; })
});
````

Your reducer will receive an array of
[MediaDeviceInfo](https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo) objects, which is exported as type VideoDevices in this library.

Getting camera permissions
--------------------------
On most mobile devices and PC browsers, you must supply permission for using the Camera before actually accessing the camera.  This usually occurs the first time your application requests to use the camera.  BUT, on Android for Chrome, and probably other browsers, you have to have permission to use the camera before enumerating which ones are available, and the enumeration request does NOT ask permission like it does on desktop!  Therefore, we provide this convenience method for doing a quick on-off cycle of the camera to prompt the user for permission.  You should use this if you need to enumerate the available camera devices before a user has specifically requested to use the camera.

````javascript
import { useDispatch } from 'react-redux';
import { requestCameraPermission } from '@ericblade/quagga2-redux-middleware';
...
const dispatch = useDispatch();
dispatch(requestCameraPermission());
````

You should eventually receive back a cameraPermissionSuccessful action or a cameraNoPermission action.
If no camera capabilities are available, this may return cameraNoPermission, so you probably want
to check that first.

In my project, I have a user-interface that allows the user to select a camera device based on it's
label, and then that passes the associated deviceId to Quagga2's init() function, as well as storing
the user's selection of deviceId into semi-permanent storage for re-use on the next application run.
