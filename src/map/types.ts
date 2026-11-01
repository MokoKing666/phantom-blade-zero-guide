/**
 * 地图与证据系统的完整类型定义。
 *
 * 三层结构：Chapter → Region → MapArea → (MapNode | MapMarker)
 * 证据三层：*Input（作者数据） → *Resolved（构建产物） → *DTO（组件消费）
 *
 * 铁律：
 * 1. 组件只接受 *Resolved / *DTO，不接受 *Input。
 * 2. 计算字段（status / independentGroups / displayable / rootGroupId）只由构建器产生。
 * 3. 拓扑坐标 mapCoord 与游戏世界坐标无任何换算关系。
 */

// ═══════════════════════ 标识 ═══════════════════════

export type ChapterId = string;
export type RegionId = string;
export type AreaId = string;

// ═══════════════════════ 几何 ═══════════════════════

/** 画布边界框；可为负（左/上溢出靠扩 minX/minY 解决） */
export interface CanvasBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface Point {
  x: number;
  y: number;
}

// ═══════════════════════ 作用域 ═══════════════════════

/**
 * 归属作用域。
 * - kind='region'：挂在某 Region 下，可带 areaId 表示"某区域下的某子区"
 * - kind='area'：**仅允许**用于 regionId === null 的 MapArea
 */
export type MapScope =
  | { kind: 'region'; regionId: RegionId; areaId?: string }
  | { kind: 'area'; areaId: string };

// ═══════════════════════ 来源 ═══════════════════════

export type SourceKind =
  | 'official'
  | 'media'
  | 'community'
  | 'database'
  | 'in-game'
  | 'local-artifact'
  | 'technical-test';

/** 作者输入：不含 rootGroupId */
export interface SourceGroupInput {
  /** 不得以 "__" 开头（保留给内部组） */
  id: string;
  displayName: string;
  /** 指向根组 id */
  isMirrorOf?: string;
  /** 必须为合法 http(s) URL */
  canonicalUrl: string;
}

/** 构建产物 */
export interface SourceGroup extends SourceGroupInput {
  /** 构建器生成，作者不填 */
  rootGroupId: string;
}

export interface SourceRef {
  id: string;
  /** 必须存在于 groups */
  groupId: string;
  publisher: string;
  author?: string;
  title: string;
  /** 必须为合法 http(s) URL */
  url: string;
  publishedAt?: string;
  accessedAt: string;
  kind: SourceKind;
  lang: 'zh' | 'en' | 'other';
  /** 支持哪些 factKey（不表达结论值） */
  supports: string[];
}

export interface InGameObservation {
  id: string;
  platform: 'pc-steam' | 'pc-epic' | 'pc-wegame' | 'ps5';
  gameVersion: string;
  capturedAt: string;
  observer: string;
  method: 'manual' | 'screenshot' | 'save-inspection';
  observed: string[];
  /** 支持哪些 factKey */
  supports: string[];
  screenshotRef?: string;
}

/**
 * 结论断言。source 与 observation 用 evidenceKind 区分，
 * 因此组合键 `${evidenceKind}:${evidenceId}` 才唯一。
 */
export type SourceAssertion =
  | {
      evidenceKind: 'source';
      evidenceId: string;
      factKey: string;
      value: string | number | boolean;
    }
  | {
      evidenceKind: 'observation';
      evidenceId: string;
      factKey: string;
      value: string | number | boolean;
    };

// ═══════════════════════ 证据 ═══════════════════════

export type FactStatus = 'verified' | 'single-source' | 'disputed' | 'unverified';

export type PositionAccuracy = 'schematic' | 'anchored' | 'measured';

export type PositionBasis =
  | 'guide-order'
  | 'guide-narrative'
  | 'in-game-observation'
  | 'none';

/** 事实键的元数据（fact-registry.json） */
export interface FactMeta {
  kind: 'value' | 'existence';
  /** kind='value' 时必填 */
  valueType?: 'number' | 'string' | 'boolean';
  desc?: string;
}

export interface DeclaredDispute {
  note: string;
  by: string;
  at: string;
}

/** 作者输入：无 status，由构建器计算 */
export interface FactEvidenceInput {
  /** 一个 Input 只对应一个事实键 */
  factKey: string;
  sourceIds: string[];
  observationIds: string[];
  declaredDispute?: DeclaredDispute;
  checkedAt: string;
  checkedBy: string;
  note?: string;
}

export interface PositionEvidenceInput {
  accuracy: PositionAccuracy;
  basis: PositionBasis;
  sourceIds: string[];
  observationIds: string[];
  checkedAt: string;
  checkedBy: string;
  note?: string;
}

/** 构建产物 */
export interface FactEvidenceResolved {
  factKey: string;
  sources: SourceRef[];
  observations: InGameObservation[];
  status: FactStatus;
  independentGroups: number;
  displayable: boolean;
  declaredDispute?: DeclaredDispute;
  checkedAt: string;
  checkedBy: string;
  note?: string;
}

/** 构建产物 */
export interface PositionEvidenceResolved {
  accuracy: PositionAccuracy;
  basis: PositionBasis;
  sources: SourceRef[];
  observations: InGameObservation[];
  checkedAt: string;
  checkedBy: string;
  note?: string;
}

/** 待实测：可展示，但不属于已核验事实 */
export interface PendingMeasurement {
  id: string;
  subject: string;
  description: string;
  requiredMethod: 'in-game' | 'local-artifact' | 'technical-test';
  blockedBy?: string;
  createdAt: string;
}

// ═══════════════════════ 章节 / 区域 / 子区 ═══════════════════════

export interface ChapterInput {
  id: ChapterId;
  order: number;
  name: string;
  nameEn?: string;
  mainQuests: string[];
  regionIds: RegionId[];
  fact: FactEvidenceInput;
}

export interface RegionInput {
  id: RegionId;
  chapterId: ChapterId | null;
  chapterAssignment: 'assigned' | 'unassigned' | 'disputed';
  name: string;
  nameEn?: string;
  canvas: CanvasBox;
  layoutVersion: number;
  areaIds: AreaId[];
  fact: FactEvidenceInput;
}

export type AreaCountedAsRegionBy =
  | 'official'
  | 'maxroll'
  | 'thegamer'
  | 'gamersky'
  | '17173'
  | '3dm'
  | 'powerpyx';

export interface MapAreaInput {
  id: AreaId;
  /** 上级 Region 未核实时为 null，不得为过类型检查而错填 */
  regionId: RegionId | null;
  assignmentStatus: 'assigned' | 'unassigned' | 'disputed';
  name: string;
  nameEn?: string;
  alias?: string[];
  countedAsRegionBy: AreaCountedAsRegionBy[];
  parentAreaId?: AreaId;
  fact: FactEvidenceInput;
}

export interface CategoryInput {
  id: string;
  label: string;
  /** CSS token 变量名 */
  color: string;
  order: number;
  /** false → 默认隐藏（面板可见） */
  enabled: boolean;
  countsTowardProgress: boolean | 'partial';
  fact: FactEvidenceInput;
}

// ═══════════════════════ 节点 ═══════════════════════

export type NodeKind =
  | 'area-entry'
  | 'bell'
  | 'junction'
  | 'entrance'
  | 'exit'
  | 'elevator';

export interface NodeLayout {
  kind: 'flow-order';
  /** 攻略流程顺序，非空间位置 */
  rank: number;
  branch: number;
  loopBackTo?: string;
  manualOverride?: Point;
}

export interface MapNodeInput {
  id: string;
  scope: MapScope;
  name: string;
  alias?: string[];
  kind: NodeKind;
  /** 拓扑坐标，持久化，加载只读 */
  mapCoord: Point;
  /** 游戏内位置：文字描述，不含数值坐标 */
  gameLocation?: string;
  layout: NodeLayout;
  labelAtTier: 0 | 1 | 2 | 3;
  fact: FactEvidenceInput;
  position: PositionEvidenceInput;
}

// ═══════════════════════ 连线 ═══════════════════════

export type LinkKind = 'guide-sequence' | 'road' | 'oneway' | 'shortcut' | 'vertical';

/** 通行方向性；与 position.accuracy 无关 */
export type Traversal = 'both' | 'forward';

interface MapLinkBaseInput {
  id: string;
  scope: MapScope;
  from: string;
  to: string;
  fact: FactEvidenceInput;
}

export type MapLinkInput =
  | (MapLinkBaseInput & {
      kind: 'guide-sequence';
      position: PositionEvidenceInput & {
        accuracy: 'schematic';
        basis: 'guide-order';
      };
    })
  | (MapLinkBaseInput & {
      kind: 'road' | 'shortcut' | 'vertical';
      traversal: Traversal;
      position: PositionEvidenceInput & {
        accuracy: 'anchored' | 'measured';
        basis: 'guide-narrative' | 'in-game-observation';
      };
    })
  | (MapLinkBaseInput & {
      kind: 'oneway';
      traversal: 'forward';
      position: PositionEvidenceInput & {
        accuracy: 'anchored' | 'measured';
        basis: 'guide-narrative' | 'in-game-observation';
      };
    });

// ═══════════════════════ 标记 ═══════════════════════

export interface MapMarkerInput {
  id: string;
  scope: MapScope;
  categoryId: string;
  name: string;
  alias?: string[];
  mapCoord: Point;
  gameLocation?: string;
  /** 直接挂靠的节点 */
  nodeId?: string;
  /** 无 nodeId 时必填：所在 MapArea 内的锚定节点 */
  areaAnchorNodeId?: string;
  /** 人工覆盖坐标，优先于算法 */
  manualOverride?: Point;
  summary: string;
  obtain?: string;
  prerequisites?: string[];
  guideSlug?: string;
  bossId?: string;
  itemId?: string;
  questId?: string;
  minTier: 0 | 1 | 2 | 3;
  progressExempt?: boolean;
  fact: FactEvidenceInput;
  position: PositionEvidenceInput;
  /** 附加事实，key = factKey */
  facts?: Record<string, FactEvidenceInput>;
}

// ═══════════════════════ 路线 ═══════════════════════

export type RouteSegmentKind = 'guide-route' | 'road-route';

interface RouteSegmentBaseInput {
  step: string;
  fromNodeId: string;
  toNodeId: string;
  viaNodeIds?: string[];
  direction: 'forward' | 'bidirectional';
  note?: string;
  fact: FactEvidenceInput;
}

export type RouteSegmentInput =
  | (RouteSegmentBaseInput & {
      kind: 'guide-route';
      position: PositionEvidenceInput & {
        accuracy: 'schematic';
        basis: 'guide-order';
      };
    })
  | (RouteSegmentBaseInput & {
      kind: 'road-route';
      /** 必须引用底层真实道路 Link，不得自造 */
      linkIds: string[];
      position: PositionEvidenceInput & {
        accuracy: 'anchored' | 'measured';
        basis: 'guide-narrative' | 'in-game-observation';
      };
    });

export interface MapRouteInput {
  id: string;
  scope: MapScope;
  name: string;
  /** 仅 UI 分组与配色，不表示捷径已确认 */
  grouping: 'main' | 'collect' | 'boss' | 'shortcut';
  /** 必须由 shortcut Link 的独立证据支撑 */
  shortcutConfirmed?: boolean;
  guideSlug?: string;
  segments: RouteSegmentInput[];
  fact: FactEvidenceInput;
}

// ═══════════════════════ 计数 ═══════════════════════

export interface GuideSnapshot {
  id: string;
  publisher: string;
  author?: string;
  url: string;
  publishedAt?: string;
  accessedAt: string;
  /** 攻略地点数 */
  locations: number;
  byCategory: Record<string, number>;
  progressExempt: { count: number; items: string[]; note?: string };
  status: 'current' | 'historical';
  supersededBy?: string;
}

export interface CollectibleCountsInput {
  byGuideEntries: { total: number; snapshotId: string; fact: FactEvidenceInput };
  byItemEntries: { total: number | null; note: string; fact: FactEvidenceInput };
  byCategory: {
    values: Record<string, number>;
    snapshotId: string;
    /** 每个分类键各一份事实证据 */
    facts: Record<string, FactEvidenceInput>;
    /** sum 键 */
    sumFact: FactEvidenceInput;
  };
  inGameProgress: {
    total: number | null;
    platform: string;
    gameVersion: string;
    capturedAt: string | null;
    fact: FactEvidenceInput;
    pending?: PendingMeasurement;
  };
  history: GuideSnapshot[];
  consistency: 'consistent' | 'divergent' | 'unknown';
}

// ═══════════════════════ Resolved / DTO ═══════════════════════

/** 逐成员映射，保留判别联合每个分支与其专属字段 */
type ResolveFields<T> = {
  [K in keyof T]: K extends 'fact'
    ? FactEvidenceResolved
    : K extends 'position'
      ? PositionEvidenceResolved
      : K extends 'facts'
        ? Record<string, FactEvidenceResolved>
        : T[K];
};

/**
 * 分配式转换：`T extends unknown` 触发对联合类型逐分支求值。
 * 若写成 `Omit<T,…> & {…}`，联合会被塌缩成所有成员字段的交集，
 * 导致 MapLinkDTO 丢失 traversal、RouteSegmentDTO 丢失 linkIds。
 */
export type Resolved<T> = T extends unknown ? ResolveFields<T> : never;

export type ChapterDTO = Omit<ChapterInput, 'fact'> & { fact: FactEvidenceResolved };
export type RegionDTO = Omit<RegionInput, 'fact'> & { fact: FactEvidenceResolved };
export type MapAreaDTO = Omit<MapAreaInput, 'fact'> & { fact: FactEvidenceResolved };
export type CategoryDTO = Omit<CategoryInput, 'fact'> & { fact: FactEvidenceResolved };

export type MapNodeDTO = Resolved<MapNodeInput>;
export type MapLinkDTO = Resolved<MapLinkInput>;
export type MapMarkerDTO = Resolved<MapMarkerInput>;
export type RouteSegmentDTO = Resolved<RouteSegmentInput>;

export type MapRouteDTO = Omit<MapRouteInput, 'fact' | 'segments'> & {
  fact: FactEvidenceResolved;
  segments: RouteSegmentDTO[];
};

export type CollectibleCountsDTO = {
  byGuideEntries: { total: number; snapshotId: string; evidence: FactEvidenceResolved };
  byItemEntries: { total: number | null; note: string; evidence: FactEvidenceResolved };
  byCategory: {
    values: Record<string, number>;
    /** 计算字段：由 values 求和 */
    sum: number;
    snapshotId: string;
    evidence: Record<string, FactEvidenceResolved>;
    sumEvidence: FactEvidenceResolved;
  };
  inGameProgress: {
    total: number | null;
    platform: string;
    gameVersion: string;
    capturedAt: string | null;
    evidence: FactEvidenceResolved;
    pending?: PendingMeasurement;
  };
  history: GuideSnapshot[];
  consistency: 'consistent' | 'divergent' | 'unknown';
};

// ═══════════════════════ 编译期守卫 ═══════════════════════

/** 分配式类型必须保留的三点 */
type _L1 = Extract<MapLinkDTO, { kind: 'road' }> extends { traversal: Traversal }
  ? true
  : never;
type _L2 = Extract<MapLinkDTO, { kind: 'guide-sequence' }> extends { traversal: unknown }
  ? never
  : true;
type _R1 = Extract<RouteSegmentDTO, { kind: 'road-route' }> extends { linkIds: string[] }
  ? true
  : never;

export const _typeGuards: [_L1, _L2, _R1] = [true, true, true];

type IsEvidenceInput<T> = T extends FactEvidenceInput
  ? true
  : T extends PositionEvidenceInput
    ? true
    : false;

/** 递归遍历对象属性、数组、Record、联合分支 */
export type DeepContainsInput<T> = IsEvidenceInput<T> extends true
  ? true
  : T extends readonly (infer U)[]
    ? DeepContainsInput<U>
    : T extends object
      ? { [K in keyof T]-?: DeepContainsInput<T[K]> }[keyof T] extends false
        ? false
        : true
      : false;

/** 含 Input 即 never，放入「必须为 true」的元组会触发编译错误 */
type NoInputLeak<T> = DeepContainsInput<T> extends true ? never : true;

export const _leakCheck: [
  NoInputLeak<ChapterDTO>,
  NoInputLeak<RegionDTO>,
  NoInputLeak<MapAreaDTO>,
  NoInputLeak<CategoryDTO>,
  NoInputLeak<MapNodeDTO>,
  NoInputLeak<MapLinkDTO>,
  NoInputLeak<MapMarkerDTO>,
  NoInputLeak<RouteSegmentDTO>,
  NoInputLeak<MapRouteDTO>,
  NoInputLeak<CollectibleCountsDTO>,
] = [true, true, true, true, true, true, true, true, true, true];
