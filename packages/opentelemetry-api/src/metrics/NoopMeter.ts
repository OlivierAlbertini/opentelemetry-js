/*!
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Meter } from './Meter';
import { MetricOptions, Metric, Labels, LabelSet, MetricUtils } from './Metric';
import { BoundMeasure, BoundCounter } from './BoundInstrument';
import { DistributedContext } from '../distributed_context/DistributedContext';
import { SpanContext } from '../trace/span_context';

/**
 * NoopMeter is a noop implementation of the {@link Meter} interface. It reuses
 * constant NoopMetrics for all of its methods.
 */
export class NoopMeter implements Meter {
  constructor() {}

  /**
   * Returns constant noop measure.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  createMeasure(name: string, options?: MetricOptions): Metric<BoundMeasure> {
    return NOOP_MEASURE_METRIC;
  }

  /**
   * Returns a constant noop counter.
   * @param name the name of the metric.
   * @param [options] the metric options.
   */
  createCounter(name: string, options?: MetricOptions): Metric<BoundCounter> {
    return NOOP_COUNTER_METRIC;
  }

  labels(labels: Labels): LabelSet {
    return NOOP_LABEL_SET;
  }
}

export class NoopMetric<T> implements Metric<T> {
  private readonly _instrument: T;

  constructor(instrument: T) {
    this._instrument = instrument;
  }
  /**
   * Returns a Bound Instrument associated with specified LabelSet.
   * It is recommended to keep a reference to the Bound Instrument instead of
   * always calling this method for every operations.
   * @param labels the canonicalized LabelSet used to associate with this
   *     metric instrument.
   */
  bind(labels: LabelSet): T {
    return this._instrument;
  }

  /**
   * Returns a Bound Instrument for a metric with all labels not set.
   */
  getDefaultBound(): T {
    return this._instrument;
  }

  /**
   * Removes the Binding from the metric, if it is present.
   * @param labels the canonicalized LabelSet used to associate with this
   *     metric instrument.
   */
  unbind(labels: LabelSet): void {
    return;
  }

  /**
   * Clears all timeseries from the Metric.
   */
  clear(): void {
    return;
  }

  setCallback(fn: () => void): void {
    return;
  }
}

export class NoopCounterMetric extends NoopMetric<BoundCounter>
  implements Pick<MetricUtils, 'add'> {
  add(value: number, labelSet: LabelSet) {
    this.bind(labelSet).add(value);
  }
}

export class NoopMeasureMetric extends NoopMetric<BoundMeasure>
  implements Pick<MetricUtils, 'record'> {
  record(
    value: number,
    labelSet: LabelSet,
    distContext?: DistributedContext,
    spanContext?: SpanContext
  ) {
    if (typeof distContext === 'undefined') {
      this.bind(labelSet).record(value);
    } else if (typeof spanContext === 'undefined') {
      this.bind(labelSet).record(value, distContext);
    } else {
      this.bind(labelSet).record(value, distContext, spanContext);
    }
  }
}

export class NoopBoundCounter implements BoundCounter {
  add(value: number): void {
    return;
  }
}

export class NoopBoundMeasure implements BoundMeasure {
  record(
    value: number,
    distContext?: DistributedContext,
    spanContext?: SpanContext
  ): void {
    return;
  }
}

export const NOOP_METER = new NoopMeter();
export const NOOP_BOUND_COUNTER = new NoopBoundCounter();
export const NOOP_COUNTER_METRIC = new NoopCounterMetric(NOOP_BOUND_COUNTER);

export const NOOP_BOUND_MEASURE = new NoopBoundMeasure();
export const NOOP_MEASURE_METRIC = new NoopMeasureMetric(NOOP_BOUND_MEASURE);

export const NOOP_LABEL_SET = {} as LabelSet;
