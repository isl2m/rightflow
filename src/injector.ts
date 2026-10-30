export function getAgyProxyCode(): string {
  return 'async renderIframe(a,b,c){var d=this.buildIframeUrl(b,c);console.log(`[Jetski] Loading iframe URL: ${zv(d)}`);\\n' +
'try{\\n' +
'  const rf=globalThis.__rightflow_proxy||(globalThis.__rightflow_proxy=(function(){\\n' +
'    const http=require("http"),net=require("net"),fs=require("fs"),path=require("path");\\n' +
'    let wbDir=path.resolve(__dirname,"..","..","..","out","vs","workbench");\\n' +
'    if(!fs.existsSync(path.join(wbDir,"rightflow.js"))){\\n' +
'      wbDir=path.resolve(__dirname,"..","..","out","vs","workbench");\\n' +
'    }\\n' +
'    const rfJsPath=path.join(wbDir,"rightflow.js");\\n' +
'    const rfCssPath=path.join(wbDir,"rightflow.css");\\n' +
'    let targetPort=0;\\n' +
'    let readyCbs=[];\\n' +
'    const srv=http.createServer((req,res)=>{\\n' +
'      if(req.url==="/rightflow.css"){\\n' +
'        try{\\n' +
'          const css=fs.readFileSync(rfCssPath,"utf8");\\n' +
'          res.writeHead(200,{"Content-Type":"text/css; charset=utf-8"});\\n' +
'          res.end(css);return;\\n' +
'        }catch(e){res.writeHead(500);res.end();return;}\\n' +
'      }\\n' +
'      if(req.url==="/rightflow.js"){\\n' +
'        try{\\n' +
'          const js=fs.readFileSync(rfJsPath,"utf8");\\n' +
'          res.writeHead(200,{"Content-Type":"application/javascript; charset=utf-8"});\\n' +
'          res.end(js);return;\\n' +
'        }catch(e){res.writeHead(500);res.end();return;}\\n' +
'      }\\n' +
'      const isHtml=req.url==="/"||req.url.startsWith("/?");\\n' +
'      const headers={...req.headers,host:`127.0.0.1:${targetPort}`};\\n' +
'      if(isHtml)delete headers["accept-encoding"];\\n' +
'      const opt={hostname:"127.0.0.1",port:targetPort,path:req.url,method:req.method,headers:headers};\\n' +
'      const proxyReq=http.request(opt,(proxyRes)=>{\\n' +
'        if(isHtml&&proxyRes.statusCode===200){\\n' +
'          let body="";proxyRes.setEncoding("utf8");\\n' +
'          proxyRes.on("data",chunk=>{body+=chunk;});\\n' +
'          proxyRes.on("end",()=>{\\n' +
'            let injected=body.replace("</head>","<link rel=\\"stylesheet\\" href=\\"/rightflow.css\\">\\\\n</head>").replace("</body>","<script src=\\"/rightflow.js\\"></script>\\\\n</body>");\\n' +
'            if(injected.includes("trusted-types")&&!injected.includes("rightflow")){\\n' +
'              injected=injected.replace(/(trusted-types\\\\s+)([^;]+?)(;)/i,"$1$2 rightflow \'allow-duplicates\'$3");\\n' +
'            }\\n' +
'            const resHeaders={...proxyRes.headers};\\n' +
'            delete resHeaders["content-length"];\\n' +
'            delete resHeaders["content-encoding"];\\n' +
'            resHeaders["content-type"]="text/html; charset=utf-8";\\n' +
'            res.writeHead(proxyRes.statusCode,resHeaders);\\n' +
'            res.end(injected);\\n' +
'          });\\n' +
'        }else{\\n' +
'          res.writeHead(proxyRes.statusCode,proxyRes.headers);\\n' +
'          proxyRes.pipe(res);\\n' +
'        }\\n' +
'      });\\n' +
'      proxyReq.on("error",()=>res.writeHead(502).end("Bad Gateway"));\\n' +
'      req.pipe(proxyReq);\\n' +
'    });\\n' +
'    srv.on("upgrade",(req,socket,head)=>{\\n' +
'      const proxySocket=net.connect(targetPort,"127.0.0.1",()=>{\\n' +
'        let reqHeaders=`${req.method} ${req.url} HTTP/1.1\\\\r\\\\n`;\\n' +
'        for(let i=0;i<req.rawHeaders.length;i+=2){\\n' +
'          let k=req.rawHeaders[i],v=req.rawHeaders[i+1];\\n' +
'          if(k.toLowerCase()==="host")v=`127.0.0.1:${targetPort}`;\\n' +
'          reqHeaders+=`${k}: ${v}\\\\r\\\\n`;\\n' +
'        }\\n' +
'        reqHeaders+="\\\\r\\\\n";\\n' +
'        proxySocket.write(reqHeaders);\\n' +
'        if(head&&head.length)proxySocket.write(head);\\n' +
'        proxySocket.pipe(socket);socket.pipe(proxySocket);\\n' +
'      });\\n' +
'      proxySocket.on("error",()=>socket.destroy());\\n' +
'      socket.on("error",()=>proxySocket.destroy());\\n' +
'    });\\n' +
'    srv.listen(0,"127.0.0.1",()=>{\\n' +
'      readyCbs.forEach(cb=>cb());\\n' +
'      readyCbs=[];\\n' +
'    });\\n' +
'    return{\\n' +
'      setTargetPort:p=>{targetPort=p;},\\n' +
'      getPort:()=>srv.address()?.port,\\n' +
'      onReady:cb=>{if(srv.address()?.port)cb();else readyCbs.push(cb);}\\n' +
'    };\\n' +
'  })());\\n' +
'  if(!rf.getPort()){\\n' +
'    await Promise.race([\\n' +
'      new Promise(r=>rf.onReady(r)),\\n' +
'      new Promise(r=>setTimeout(r,1000))\\n' +
'    ]);\\n' +
'  }\\n' +
'  const m=b.match(/:(\\\\d+)/);\\n' +
'  if(m&&rf.getPort()){\\n' +
'    const hp=parseInt(m[1],10);\\n' +
'    rf.setTargetPort(hp);\\n' +
'    const pp=rf.getPort();\\n' +
'    b=b.replace(":"+hp,":"+pp);\\n' +
'    d=d.replace(":"+hp,":"+pp);\\n' +
'  }\\n' +
'}catch(e){console.error("[RightFlow] Proxy error:",e);}\\n' +
'this.renderWebviewHtml(a,b,d,c)}';
}

import * as fs from 'fs/promises';
import * as path from 'path';
import { IdeInstallation, InjectionResult, InstallationStatus } from './types';
import {
  INJECTED_CSS,
  INJECTED_CSS_FILENAME,
  INJECTED_JS,
  INJECTED_JS_FILENAME,
  getInjectedCss,
} from './content';

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export function patchCspTrustedTypes(html: string): { html: string; changed: boolean } {
  const ttRegex = /(trusted-types\s+)([^;]+?)(;)/i;
  const match = html.match(ttRegex);
  if (!match) {
    return { html, changed: false };
  }

  const existingPolicies = match[2];
  if (/\b\*\b/.test(existingPolicies) || /\brightflow\b/.test(existingPolicies)) {
    return { html, changed: false };
  }

  const needsAllowDuplicates = !existingPolicies.includes("'allow-duplicates'");
  const addition = ` rightflow${needsAllowDuplicates ? " 'allow-duplicates'" : ''}`;

  const trailingWhitespaceMatch = existingPolicies.match(/\s+$/);
  let updatedPolicies = '';
  if (trailingWhitespaceMatch) {
    const trailingWs = trailingWhitespaceMatch[0];
    const base = existingPolicies.slice(0, -trailingWs.length);
    updatedPolicies = `${base}${addition}${trailingWs}`;
  } else {
    updatedPolicies = `${existingPolicies}${addition}`;
  }

  const updatedHtml = html.replace(ttRegex, `$1${updatedPolicies}$3`);
  return { html: updatedHtml, changed: true };
}

export function unpatchCspTrustedTypes(html: string): { html: string; changed: boolean } {
  const ttRegex = /(trusted-types\s+)([^;]+?)(;)/i;
  const match = html.match(ttRegex);
  if (!match) {
    return { html, changed: false };
  }

  const existingPolicies = match[2];
  if (!/\brightflow\b/.test(existingPolicies)) {
    return { html, changed: false };
  }

  let cleanedPolicies = existingPolicies
    .replace(/\s*rightflow\b/g, '')
    .replace(/\s*'allow-duplicates'/g, '');

  const updatedHtml = html.replace(ttRegex, `$1${cleanedPolicies}$3`);
  return { html: updatedHtml, changed: true };
}

export async function isAlreadyInjected(
  installation: IdeInstallation
): Promise<boolean> {
  try {
    const htmlContent = await fs.readFile(
      installation.workbenchHtmlPath,
      'utf-8'
    );
    const hasCss = htmlContent.includes(INJECTED_CSS_FILENAME);
    const hasJs = htmlContent.includes(INJECTED_JS_FILENAME);
    const hasCsp = !htmlContent.includes('trusted-types') || htmlContent.includes('rightflow');
    return hasCss && hasJs && hasCsp;
  } catch {
    return false;
  }
}

export async function checkStatus(
  installation: IdeInstallation
): Promise<InstallationStatus> {
  const isInstalled = await isAlreadyInjected(installation);
  const htmlBackupExists = await fileExists(
    installation.workbenchHtmlPath + '.bak'
  );
  const productBackupExists = await fileExists(
    installation.productJsonPath + '.bak'
  );

  let assetsUpToDate = false;
  try {
    const cssPath = path.join(
      installation.workbenchDir,
      INJECTED_CSS_FILENAME
    );
    const jsPath = path.join(
      installation.workbenchDir,
      INJECTED_JS_FILENAME
    );
    const cssContent = await fs.readFile(cssPath, 'utf-8');
    const jsContent = await fs.readFile(jsPath, 'utf-8');
    const expectedCss = getInjectedCss();
    assetsUpToDate =
      cssContent === expectedCss && jsContent === INJECTED_JS;
  } catch {
    assetsUpToDate = false;
  }

  return {
    installation,
    isInstalled,
    htmlBackupExists,
    productBackupExists,
    assetsUpToDate,
  };
}

export async function injectRtl(
  installation: IdeInstallation
): Promise<InjectionResult> {
  const messages: string[] = [];
  let changed = false;

  try {
    // 1. Create backups if not exist
    const htmlBackup = installation.workbenchHtmlPath + '.bak';
    if (!(await fileExists(htmlBackup))) {
      await fs.copyFile(installation.workbenchHtmlPath, htmlBackup);
      messages.push(`Created backup: ${path.basename(htmlBackup)}`);
    }

    const productBackup = installation.productJsonPath + '.bak';
    if (!(await fileExists(productBackup))) {
      await fs.copyFile(installation.productJsonPath, productBackup);
      messages.push(`Created backup: ${path.basename(productBackup)}`);
    }

    // 2. Modify workbench.html
    let html = await fs.readFile(installation.workbenchHtmlPath, 'utf-8');
    const alreadyHasTags = html.includes(INJECTED_CSS_FILENAME) && html.includes(INJECTED_JS_FILENAME);
    let htmlChanged = false;

    if (alreadyHasTags) {
      const cspRes = patchCspTrustedTypes(html);
      if (cspRes.changed) {
        html = cspRes.html;
        htmlChanged = true;
        messages.push('Configured Trusted Types policy whitelist in CSP');
      }
    } else {
      // Clean up any legacy injection from previous versions or other extensions
      html = html.replace(
        /\s*<!--\s*(?:Antigravity (?:Chat )?RTL(?: Pro)?|RightFlow)[^-]*-->\s*<link rel="stylesheet"[^>]+>/gi,
        ''
      );
      html = html.replace(
        /\s*<!--\s*(?:Antigravity (?:Chat )?RTL(?: Pro)?|RightFlow)[^-]*-->\s*<script[^>]+><\/script>/gi,
        ''
      );

      const cssTag = `\t<!-- RightFlow -->\n\t<link rel="stylesheet" href="../../../workbench/${INJECTED_CSS_FILENAME}">\n</head>`;
      const jsTag = `\t<!-- RightFlow -->\n\t<script src="../../../workbench/${INJECTED_JS_FILENAME}"></script>\n</html>`;

      if (!html.includes(INJECTED_CSS_FILENAME)) {
        html = html.replace('</head>', cssTag);
        htmlChanged = true;
      }
      if (!html.includes(INJECTED_JS_FILENAME)) {
        html = html.replace('</html>', jsTag);
        htmlChanged = true;
      }

      const cspResult = patchCspTrustedTypes(html);
      if (cspResult.changed) {
        html = cspResult.html;
        htmlChanged = true;
        messages.push('Configured Trusted Types policy whitelist in CSP');
      }
    }

    if (htmlChanged) {
      await fs.writeFile(installation.workbenchHtmlPath, html, 'utf-8');
      messages.push(`Patched ${path.basename(installation.workbenchHtmlPath)}`);
      changed = true;
    }
    // 2b. Modify secondary HTML (Antigravity Jetski Agent Panel) if present
    if (installation.secondaryHtmlPath) {
      const secBackup = installation.secondaryHtmlPath + '.bak';
      if (!(await fileExists(secBackup))) {
        await fs.copyFile(installation.secondaryHtmlPath, secBackup);
        messages.push(`Created backup: ${path.basename(secBackup)}`);
      }

      let secHtml = await fs.readFile(installation.secondaryHtmlPath, 'utf-8');
      const secAlreadyHasTags = secHtml.includes(INJECTED_CSS_FILENAME) && secHtml.includes(INJECTED_JS_FILENAME);
      let secChanged = false;

      if (secAlreadyHasTags) {
        const secCspRes = patchCspTrustedTypes(secHtml);
        if (secCspRes.changed) {
          secHtml = secCspRes.html;
          secChanged = true;
        }
      } else {
        secHtml = secHtml.replace(
          /\s*<!--\s*(?:Antigravity (?:Chat )?RTL(?: Pro)?|RightFlow)[^-]*-->\s*<link rel="stylesheet"[^>]+>/gi,
          ''
        );
        secHtml = secHtml.replace(
          /\s*<!--\s*(?:Antigravity (?:Chat )?RTL(?: Pro)?|RightFlow)[^-]*-->\s*<script[^>]+><\/script>/gi,
          ''
        );

        const cssTag = `\t<!-- RightFlow -->\n\t<link rel="stylesheet" href="../../../workbench/${INJECTED_CSS_FILENAME}">\n</head>`;
        const jsTag = `\t<!-- RightFlow -->\n\t<script src="../../../workbench/${INJECTED_JS_FILENAME}"></script>\n</html>`;

        if (!secHtml.includes(INJECTED_CSS_FILENAME)) {
          secHtml = secHtml.replace('</head>', cssTag);
          secChanged = true;
        }
        if (!secHtml.includes(INJECTED_JS_FILENAME)) {
          secHtml = secHtml.replace('</html>', jsTag);
          secChanged = true;
        }

        const secCspResult = patchCspTrustedTypes(secHtml);
        if (secCspResult.changed) {
          secHtml = secCspResult.html;
          secChanged = true;
        }
      }

      if (secChanged) {
        await fs.writeFile(installation.secondaryHtmlPath, secHtml, 'utf-8');
        messages.push(`Patched ${path.basename(installation.secondaryHtmlPath)}`);
        changed = true;
      }
    }

        // 2c. Modify Antigravity agy extension (Chat Webview Proxy) if present
    if (installation.agyExtensionJsPath) {
      const agyBackup = installation.agyExtensionJsPath + '.bak';
      if (!(await fileExists(agyBackup))) {
        await fs.copyFile(installation.agyExtensionJsPath, agyBackup);
        messages.push(`Created backup: ${path.basename(agyBackup)}`);
      }

      let agyContent = await fs.readFile(installation.agyExtensionJsPath, 'utf-8');
      if (!agyContent.includes('__rightflow_proxy')) {
        const agyTarget = 'renderIframe(a,b,c){var d=this.buildIframeUrl(b,c);console.log(`[Jetski] Loading iframe URL: ${zv(d)}`);this.renderWebviewHtml(a,b,d,c)}';
        const agyReplacement = getAgyProxyCode();
        if (agyContent.includes(agyTarget)) {
          agyContent = agyContent.replace(agyTarget, agyReplacement);
          await fs.writeFile(installation.agyExtensionJsPath, agyContent, 'utf-8');
          messages.push(`Patched Antigravity Chat proxy in ${path.basename(installation.agyExtensionJsPath)}`);
          changed = true;
        }
      }
    }

    // 3. Ensure workbenchDir exists and write injected CSS & JS
    await fs.mkdir(installation.workbenchDir, { recursive: true });
    const targetCssPath = path.join(
      installation.workbenchDir,
      INJECTED_CSS_FILENAME
    );
    const targetJsPath = path.join(
      installation.workbenchDir,
      INJECTED_JS_FILENAME
    );

    await fs.writeFile(targetCssPath, getInjectedCss(), 'utf-8');
    await fs.writeFile(targetJsPath, INJECTED_JS, 'utf-8');
    messages.push(`Assets deployed to ${installation.workbenchDir}`);
    changed = true;

    // 4. Update product.json checksums to avoid [Unsupported] warning
    try {
      const prodJsonStr = await fs.readFile(
        installation.productJsonPath,
        'utf-8'
      );
      const prodJson = JSON.parse(prodJsonStr);
      if (prodJson.checksums) {
        let prodChanged = false;
        if (prodJson.checksums[installation.checksumKey]) {
          delete prodJson.checksums[installation.checksumKey];
          prodChanged = true;
        }
        if (
          installation.secondaryChecksumKey &&
          prodJson.checksums[installation.secondaryChecksumKey]
        ) {
          delete prodJson.checksums[installation.secondaryChecksumKey];
          prodChanged = true;
        }
        if (prodChanged) {
          await fs.writeFile(
            installation.productJsonPath,
            JSON.stringify(prodJson, null, '	'),
            'utf-8'
          );
          messages.push('Updated product.json checksums');
          changed = true;
        }
      }
    } catch {
      messages.push('Notice: Could not modify product.json checksums');
    }

    return { messages, changed, permissionError: false };
  } catch (err: any) {
    const isPerm = err.code === 'EACCES' || err.code === 'EPERM';
    messages.push(`Error: ${err.message}`);
    return { messages, changed, permissionError: isPerm };
  }
}

export async function removeRtl(
  installation: IdeInstallation
): Promise<InjectionResult> {
  const messages: string[] = [];
  let changed = false;

  try {
    const htmlBackup = installation.workbenchHtmlPath + '.bak';
    if (await fileExists(htmlBackup)) {
      await fs.copyFile(htmlBackup, installation.workbenchHtmlPath);
      await fs.unlink(htmlBackup);
      messages.push(`Restored ${path.basename(installation.workbenchHtmlPath)}`);
      changed = true;
    }
    let html = await fs.readFile(installation.workbenchHtmlPath, 'utf-8');
    let cleanedHtml = html
      .replace(
        /\s*<!--\s*(?:Antigravity (?:Chat )?RTL(?: Pro)?|RightFlow)[^-]*-->\s*<link rel="stylesheet"[^>]+>/gi,
        ''
      )
      .replace(
        /\s*<!--\s*(?:Antigravity (?:Chat )?RTL(?: Pro)?|RightFlow)[^-]*-->\s*<script[^>]+><\/script>/gi,
        ''
      )
      .replace(/\s*<link rel="stylesheet"[^>]*rightflow\.css[^>]*>/gi, '')
      .replace(/\s*<script[^>]*rightflow\.js[^>]*><\/script>/gi, '');
    const unpatchCsp = unpatchCspTrustedTypes(cleanedHtml);
    if (unpatchCsp.changed) {
      cleanedHtml = unpatchCsp.html;
    }
    if (cleanedHtml !== html) {
      await fs.writeFile(installation.workbenchHtmlPath, cleanedHtml, 'utf-8');
      changed = true;
    }

    if (installation.secondaryHtmlPath) {
      const secBackup = installation.secondaryHtmlPath + '.bak';
      if (await fileExists(secBackup)) {
        await fs.copyFile(secBackup, installation.secondaryHtmlPath);
        await fs.unlink(secBackup);
        messages.push(`Restored ${path.basename(installation.secondaryHtmlPath)}`);
        changed = true;
      }
      let secHtml = await fs.readFile(installation.secondaryHtmlPath, 'utf-8');
      let cleanedSec = secHtml
        .replace(
          /\s*<!--\s*(?:Antigravity (?:Chat )?RTL(?: Pro)?|RightFlow)[^-]*-->\s*<link rel="stylesheet"[^>]+>/gi,
          ''
        )
        .replace(
          /\s*<!--\s*(?:Antigravity (?:Chat )?RTL(?: Pro)?|RightFlow)[^-]*-->\s*<script[^>]+><\/script>/gi,
          ''
        )
        .replace(/\s*<link rel="stylesheet"[^>]*rightflow\.css[^>]*>/gi, '')
        .replace(/\s*<script[^>]*rightflow\.js[^>]*><\/script>/gi, '');
      const unpatchSecCsp = unpatchCspTrustedTypes(cleanedSec);
      if (unpatchSecCsp.changed) {
        cleanedSec = unpatchSecCsp.html;
      }
      if (cleanedSec !== secHtml) {
        await fs.writeFile(installation.secondaryHtmlPath, cleanedSec, 'utf-8');
        changed = true;
      }
    }

        if (installation.agyExtensionJsPath) {
      const agyBackup = installation.agyExtensionJsPath + '.bak';
      if (await fileExists(agyBackup)) {
        await fs.copyFile(agyBackup, installation.agyExtensionJsPath);
        await fs.unlink(agyBackup);
        messages.push(`Restored original ${path.basename(installation.agyExtensionJsPath)}`);
        changed = true;
      }
    }

    const productBackup = installation.productJsonPath + '.bak';
    if (await fileExists(productBackup)) {
      await fs.copyFile(productBackup, installation.productJsonPath);
      await fs.unlink(productBackup);
      messages.push(`Restored ${path.basename(installation.productJsonPath)}`);
      changed = true;
    }

    const targetCss = path.join(
      installation.workbenchDir,
      INJECTED_CSS_FILENAME
    );
    const targetJs = path.join(
      installation.workbenchDir,
      INJECTED_JS_FILENAME
    );
    if (await fileExists(targetCss)) await fs.unlink(targetCss);
    if (await fileExists(targetJs)) await fs.unlink(targetJs);
    messages.push('Cleaned injected assets');
    changed = true;

    return { messages, changed, permissionError: false };
  } catch (err: any) {
    const isPerm = err.code === 'EACCES' || err.code === 'EPERM';
    messages.push(`Error: ${err.message}`);
    return { messages, changed, permissionError: isPerm };
  }
}

export async function reinjectAssets(
  installation: IdeInstallation
): Promise<void> {
  await fs.mkdir(installation.workbenchDir, { recursive: true });
  const targetCss = path.join(
    installation.workbenchDir,
    INJECTED_CSS_FILENAME
  );
  const targetJs = path.join(
    installation.workbenchDir,
    INJECTED_JS_FILENAME
  );
  await fs.writeFile(targetCss, getInjectedCss(), 'utf-8');
  await fs.writeFile(targetJs, INJECTED_JS, 'utf-8');
}
