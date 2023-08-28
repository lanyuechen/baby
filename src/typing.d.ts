import '@babylonjs/core';

import type Boundary from '@/components/Boundary';
import type Sun from '@/components/Sun';
import type Skybox from '@/components/Skybox';

/**
 * 在scene中存储一些相关内容，方便操作
 */
declare module '@babylonjs/core' {
  declare interface Scene {
    boundary?: Boundary;
    sun?: Sun;
    skybox?: Skybox;
  }
}