/**
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { h, FunctionalComponent } from 'preact';

import baseCss from 'css:./base.css';
import initialCss from 'initial-css:';
import { allSrc } from 'client-bundle:client/initial-app';
import favicon from 'url:static-build/assets/favicon.ico';
import ogImage from 'url:static-build/assets/icon-large-maskable.png';
import { escapeStyleScriptContent, siteOrigin } from 'static-build/utils';
import Intro from 'shared/prerendered-app/Intro';
import snackbarCss from 'css:../../../shared/custom-els/snack-bar/styles.css';
import * as snackbarStyle from '../../../shared/custom-els/snack-bar/styles.css';

interface Props {}

const Index: FunctionalComponent<Props> = () => (
  <html lang="zh-cn">
    <head>
      <title>图片压缩工具 - CZL-Squoosh</title>
      <meta charSet="UTF-8"/>
      <meta
        name="description"
        content="图片压缩工具 - CZL基于Squoorsh, Squoosh 是一款终极图像优化工具，可让你在浏览器中使用不同的编解码器对图像进行压缩和比较。"
      />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@SquooshApp" />
      <meta property="og:title" content="图片压缩工具 - CZL-Squoosh" />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={`${siteOrigin}${ogImage}`} />
      <meta
        property="og:image:secure_url"
        content={`${siteOrigin}${ogImage}`}
      />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="500" />
      <meta property="og:image:height" content="500" />
      <meta
        property="og:image:alt"
        content="在深色背景上挤压图像文件的手部卡通图示。"
      />
      <meta
        name="og:description"
        content="Squoosh 是一款终极图像优化工具，可让你在浏览器中使用不同的编解码器对图像进行压缩和比较。"
      />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
      />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <link rel="shortcut icon" href={favicon} />
      <link rel="apple-touch-icon" href={ogImage} />
      <meta name="theme-color" content="#ff3385" />
      <link rel="manifest" href="/manifest.json" />
      <link rel="canonical" href={siteOrigin} />
      <style
        dangerouslySetInnerHTML={{ __html: escapeStyleScriptContent(baseCss) }}
      />
      <style
        dangerouslySetInnerHTML={{
          __html: escapeStyleScriptContent(initialCss),
        }}
      />
    </head>
    <body>
      <div id="app">
        <Intro />
        <noscript>
          <style
            dangerouslySetInnerHTML={{
              __html: escapeStyleScriptContent(snackbarCss),
            }}
          />
          <snack-bar>
            <div
              class={snackbarStyle.snackbar}
              aria-live="assertive"
              aria-atomic="true"
              aria-hidden="false"
            >
              <div class={snackbarStyle.text}>
              初始化错误： 本网站需要 JavaScript，您的浏览器已禁用 JavaScript。
              </div>
              <a class={snackbarStyle.button} href="/">
              刷新
              </a>
            </div>
          </snack-bar>
        </noscript>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: escapeStyleScriptContent(allSrc),
        }}
      />
    </body>
  </html>
);

export default Index;
