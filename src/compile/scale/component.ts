import {ScaleChannel} from '../../channel';
import {Scale, ScaleType} from '../../scale';
import {VgDataRef, VgDomain, VgScale, VgSignalRef} from '../../vega.schema';
import {Explicit, Split} from '../split';

export type ScaleDomainComponent = any[] | VgDataRef | VgSignalRef;

export type ScaleComponentProps = {
  // TODO: integrate selectionDomain here and prevent domainRaw from below
  domains?: ScaleDomainComponent[];
} & Partial<Pick<VgScale,
  // All VgDomain property except domain.
  // (We exclude domain as we have a special "domains" array that allow us merge them all at once in assemble.)
  // TODO: also exclude domainRaw and property implement the right scaleComponent for selection domain
  'name' | 'type' | 'domainRaw' | 'range' | 'clamp' | 'exponent' | 'interpolate' | 'nice' | 'padding' | 'paddingInner' | 'paddingOuter' | 'reverse' | 'round' | 'zero'
>>;

export class ScaleComponent extends Split<Partial<ScaleComponentProps>> {
  public merged = false;

  constructor(name: string, typeWithExplicit: Explicit<ScaleType>) {
    super(
      {},     // no initial explicit property
      {name}  // name as initial implicit property
    );
    this.setWithExplicit('type', typeWithExplicit);
  }
}

export type ScaleComponentIndex = {[P in ScaleChannel]?: ScaleComponent};

export type ScaleIndex = {[P in ScaleChannel]?: Scale};
