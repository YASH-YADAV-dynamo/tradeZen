'use strict';

// Web shim for react-native-worklets PlatformChecker.
// The upstream module only sets SHOULD_BE_USE_WEB when globalThis.__RUNTIME_KIND
// is already ReactNative at import time — which is not the case on web before
// react-native-worklets/runtimeKind.js evaluates. That race forces createSerializable
// to its native variant on web and throws.
//
// This shim always reports the web/jest platform flags from react-native's Platform
// directly, bypassing the runtime-kind gate.

import { Platform } from 'react-native';

export const IS_JEST = !!(typeof process !== 'undefined' && process.env && process.env.JEST_WORKER_ID);
export const IS_WEB = Platform.OS === 'web';
export const IS_WINDOWS = Platform.OS === 'windows';
export const SHOULD_BE_USE_WEB = IS_JEST || IS_WEB || IS_WINDOWS;
