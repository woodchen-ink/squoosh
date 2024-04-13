import { EncodeOptions, AVIFTune, defaultOptions } from '../shared/meta';
import type WorkerBridge from 'client/lazy-app/worker-bridge';
import { h, Component } from 'preact';
import { preventDefault, shallowEqual } from 'client/lazy-app/util';
import * as style from 'client/lazy-app/Compress/Options/style.css';
import Checkbox from 'client/lazy-app/Compress/Options/Checkbox';
import Expander from 'client/lazy-app/Compress/Options/Expander';
import Select from 'client/lazy-app/Compress/Options/Select';
import Range from 'client/lazy-app/Compress/Options/Range';
import linkState from 'linkstate';
import Revealer from 'client/lazy-app/Compress/Options/Revealer';

export const encode = (
  signal: AbortSignal,
  workerBridge: WorkerBridge,
  imageData: ImageData,
  options: EncodeOptions,
) => workerBridge.avifEncode(signal, imageData, options);

interface Props {
  options: EncodeOptions;
  onChange(newOptions: EncodeOptions): void;
}

interface State {
  options: EncodeOptions;
  lossless: boolean;
  quality: number;
  showAdvanced: boolean;
  separateAlpha: boolean;
  alphaQuality: number;
  chromaDeltaQ: boolean;
  subsample: number;
  tileRows: number;
  tileCols: number;
  effort: number;
  sharpness: number;
  denoiseLevel: number;
  tune: AVIFTune;
  enableSharpYUV: boolean;
}

/**
 * AVIF quality ranges from 0 (worst) to 100 (lossless).
 * Since lossless is a separate checkbox, we cap user-inputted quality at 99
 *
 * AVIF speed ranges from 0 (slowest) to 10 (fastest).
 * We display it as 'effort' to the user since it conveys the speed-size tradeoff
 * much better: speed = 10 - effort
 */
const MAX_QUALITY = 100;
const MAX_EFFORT = 10;

export class Options extends Component<Props, State> {
  static getDerivedStateFromProps(
    props: Props,
    state: State,
  ): Partial<State> | null {
    if (state.options && shallowEqual(state.options, props.options)) {
      return null;
    }

    const { options } = props;

    const lossless =
      options.quality === MAX_QUALITY &&
      (options.qualityAlpha == -1 || options.qualityAlpha == MAX_QUALITY) &&
      options.subsample == 3;

    const separateAlpha = options.qualityAlpha !== -1;

    // Create default form state from options
    return {
      options,
      lossless,
      quality: lossless ? defaultOptions.quality : options.quality,
      separateAlpha,
      alphaQuality: separateAlpha ? options.qualityAlpha : options.quality,
      subsample: options.subsample,
      tileRows: options.tileRowsLog2,
      tileCols: options.tileColsLog2,
      effort: MAX_EFFORT - options.speed,
      chromaDeltaQ: options.chromaDeltaQ,
      sharpness: options.sharpness,
      denoiseLevel: options.denoiseLevel,
      tune: options.tune,
      enableSharpYUV: options.enableSharpYUV,
    };
  }

  // The rest of the defaults are set in getDerivedStateFromProps
  state: State = {
    showAdvanced: false,
  } as State;

  private _inputChangeCallbacks = new Map<string, (event: Event) => void>();

  private _inputChange = (
    prop: keyof State,
    type: 'number' | 'boolean' | 'string',
  ) => {
    // Cache the callback for performance
    if (!this._inputChangeCallbacks.has(prop)) {
      this._inputChangeCallbacks.set(prop, (event: Event) => {
        const formEl = event.target as HTMLInputElement | HTMLSelectElement;
        const newVal =
          type === 'boolean'
            ? 'checked' in formEl
              ? formEl.checked
              : !!formEl.value
            : type === 'number'
            ? Number(formEl.value)
            : formEl.value;

        const newState: Partial<State> = {
          [prop]: newVal,
        };

        const optionState = {
          ...this.state,
          ...newState,
        };

        const newOptions: EncodeOptions = {
          quality: optionState.lossless ? MAX_QUALITY : optionState.quality,
          qualityAlpha:
            optionState.lossless || !optionState.separateAlpha
              ? -1 // Set qualityAlpha to quality
              : optionState.alphaQuality,
          // Always set to 4:4:4 if lossless
          subsample: optionState.lossless ? 3 : optionState.subsample,
          tileColsLog2: optionState.tileCols,
          tileRowsLog2: optionState.tileRows,
          speed: MAX_EFFORT - optionState.effort,
          chromaDeltaQ: optionState.chromaDeltaQ,
          sharpness: optionState.sharpness,
          denoiseLevel: optionState.denoiseLevel,
          tune: optionState.tune,
          enableSharpYUV: optionState.enableSharpYUV,
        };

        // Updating options, so we don't recalculate in getDerivedStateFromProps.
        newState.options = newOptions;

        this.setState(
          // It isn't clear to me why I have to cast this :)
          newState as State,
        );

        this.props.onChange(newOptions);
      });
    }

    return this._inputChangeCallbacks.get(prop)!;
  };

  render(
    _: Props,
    {
      effort,
      lossless,
      alphaQuality,
      separateAlpha,
      quality,
      showAdvanced,
      subsample,
      tileCols,
      tileRows,
      chromaDeltaQ,
      sharpness,
      denoiseLevel,
      tune,
      enableSharpYUV,
    }: State,
  ) {
    return (
      <form class={style.optionsSection} onSubmit={preventDefault}>
        <label class={style.optionToggle}>
        无损压缩
          <Checkbox
            checked={lossless}
            onChange={this._inputChange('lossless', 'boolean')}
          />
        </label>
        <Expander>
          {!lossless && (
            <div class={style.optionOneCell}>
              <Range
                min="0"
                max={MAX_QUALITY - 1} // MAX_QUALITY would mean lossless
                value={quality}
                onInput={this._inputChange('quality', 'number')}
              >
                质量:
              </Range>
            </div>
          )}
        </Expander>
        <label class={style.optionReveal}>
          <Revealer
            checked={showAdvanced}
            onChange={linkState(this, 'showAdvanced')}
          />
          高级设置
        </label>
        <Expander>
          {showAdvanced && (
            <div>
              <Expander>
                {!lossless && (
                  <div>
                    <label class={style.optionTextFirst}>
                    子采样色度:
                      <Select
                        value={subsample}
                        onChange={this._inputChange('subsample', 'number')}
                      >
                        <option value="0">4:0:0</option>
                        <option value="1">4:2:0</option>
                        <option value="2">4:2:2</option>
                        <option value="3">4:4:4</option>
                      </Select>
                    </label>
                    <Expander>
                      {subsample === 1 && (
                        <label class={style.optionToggle}>
                          锐化YUV下采样
                          <Checkbox
                            checked={enableSharpYUV}
                            onChange={this._inputChange(
                              'enableSharpYUV',
                              'boolean',
                            )}
                          />
                        </label>
                      )}
                    </Expander>
                    <label class={style.optionToggle}>
                    分开Alpha通道质量
                      <Checkbox
                        checked={separateAlpha}
                        onChange={this._inputChange('separateAlpha', 'boolean')}
                      />
                    </label>
                    <Expander>
                      {separateAlpha && (
                        <div class={style.optionOneCell}>
                          <Range
                            min="0"
                            max={MAX_QUALITY - 1} // MAX_QUALITY would mean lossless
                            value={alphaQuality}
                            onInput={this._inputChange(
                              'alphaQuality',
                              'number',
                            )}
                          >
                            Alpha通道质量:
                          </Range>
                        </div>
                      )}
                    </Expander>
                    <label class={style.optionToggle}>
                    额外色度压缩
                      <Checkbox
                        checked={chromaDeltaQ}
                        onChange={this._inputChange('chromaDeltaQ', 'boolean')}
                      />
                    </label>
                    <div class={style.optionOneCell}>
                      <Range
                        min="0"
                        max="7"
                        value={sharpness}
                        onInput={this._inputChange('sharpness', 'number')}
                      >
                        锐度:
                      </Range>
                    </div>
                    <div class={style.optionOneCell}>
                      <Range
                        min="0"
                        max="50"
                        value={denoiseLevel}
                        onInput={this._inputChange('denoiseLevel', 'number')}
                      >
                        降噪级别:
                      </Range>
                    </div>
                    <label class={style.optionTextFirst}>
                    调整:
                      <Select
                        value={tune}
                        onChange={this._inputChange('tune', 'number')}
                      >
                        <option value={AVIFTune.auto}>自动</option>
                        <option value={AVIFTune.psnr}>PSNR</option>
                        <option value={AVIFTune.ssim}>SSIM</option>
                      </Select>
                    </label>
                  </div>
                )}
              </Expander>
              <div class={style.optionOneCell}>
                <Range
                  min="0"
                  max="6"
                  value={tileRows}
                  onInput={this._inputChange('tileRows', 'number')}
                >
                  瓦片行数的对数:
                </Range>
              </div>
              <div class={style.optionOneCell}>
                <Range
                  min="0"
                  max="6"
                  value={tileCols}
                  onInput={this._inputChange('tileCols', 'number')}
                >
                  瓦片列数的对数:
                </Range>
              </div>
            </div>
          )}
        </Expander>
        <div class={style.optionOneCell}>
          <Range
            min="0"
            max={MAX_EFFORT}
            value={effort}
            onInput={this._inputChange('effort', 'number')}
          >
            努力程度:
          </Range>
        </div>
      </form>
    );
  }
}
