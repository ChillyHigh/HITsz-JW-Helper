// ==UserScript==
// @name         HITSZ JW Helper
// @version      1.0
// @description  哈工深本科生抢课工具
// @author       ChillyHigh
// @license      MIT
// @match        *://jw.hitsz.edu.cn/Xsxk/query/1*
// @run-at       document-start
// @grant        none
// @require      https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.min.js
// @source       
// @namespace    
// ==/UserScript==

(function () {
    "use strict";


    // 处理截取到的POST请求数据
    function handleResponse(responseText, url) {
        console.log("捕获POST响应:", url);
        const response = JSON.parse(responseText);
        console.log(response);
        const classList = response.kxrwList.list;
        // 生成课程表格
        const $table = $("#ClassTable tbody");
        $table.empty();
        console.log("🔄 Update table with classes~~~");
        $.each(classList, function (index, item) {
            const $tr = $(`<tr></tr>`);
            $tr.append(`<td>${index + 1}</td>`);
            $tr.append(`<td>${item.kcmc}</td>`);
            $tr.append(`<td>${item.dgjsmc}<br>${item.pkjgmx}</td>`);
            const $btn = $('<button></button>')
                .text('抢课')
                .on('click', () => {
                    if (!confirm("是否确认开始抢课？目标：" + item.kcmc)) {
                        return;
                    }
                    // 构造选课请求
                    let real_params = new FormData();
                    real_params.append('p_dqxq', response.xsxkPage.p_dqxq);
                    real_params.append('p_xq', response.xsxkPage.p_xq);
                    real_params.append('p_xkfsdm', response.xsxkPage.p_xkfsdm);
                    real_params.append('p_dqxnxq', response.xsxkPage.p_dqxnxq);
                    real_params.append('p_xnxq', response.xsxkPage.p_xnxq);
                    real_params.append('p_pylx', response.xsxkPage.p_pylx);
                    real_params.append('p_dqxn', response.xsxkPage.p_dqxn);
                    real_params.append('p_xn', response.xsxkPage.p_xn);
                    real_params.append('p_id', item.id);
                    real_params.append('p_xktjz', response.xsxkPage.xkgzszOne.xkms == "1" ? "rwtjzyx" : "rwtjzyx");

                    $('.qkSetting').prop('disabled', true);
                    console.log("🚀 Start for loop request. Params:", real_params);
                    LoopRequester.start('/Xsxk/addGouwuche', real_params);
                });
            $('<td></td>').append($btn).appendTo($tr);
            $table.append($tr);
        });
    }

    // 劫持XMLHttpRequest以读取POST响应
    const originalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function () {
        const xhr = new originalXHR();
        let isPost = false;
        let targetUrl;

        // 拦截open方法检测POST请求
        const originalOpen = xhr.open;
        xhr.open = function (method, url) {
            if (url.includes("Xsxk/queryKxrw")) {
                isPost = method.toUpperCase() === "POST";
            }
            targetUrl = url; // 记录请求URL
            return originalOpen.apply(xhr, arguments);
        };

        // 拦截send方法监听响应
        const originalSend = xhr.send;
        xhr.send = function (data) {
            this.addEventListener("readystatechange", function () {
                if (this.readyState === 4 && isPost) {
                    try {
                        // 读取响应内容并传递给处理函数
                        handleResponse(this.responseText, targetUrl);
                    } catch (e) {
                        console.error("读取响应失败:", e);
                    }
                }
            });
            return originalSend.apply(this, arguments);
        };
        return xhr;
    };

    const $style = $(`
<style>
    #jw-helper {
        width: 40vw;
        display: flex;
        padding: 10px;
        position: absolute;
        flex-direction: column;
        align-items: center;
        z-index: 100000;
        min-width: 550px;
    }

    #jw-helper .bg {
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        position: absolute;
        background-color: #eeec;
        backdrop-filter: blur(2.5px);
        border-radius: 10px;
        box-shadow: 0 0 7.5px 5px #0004;
        z-index: 0;
    }

    #jw-helper .component {
        width: 90%;
        max-height: 25vh;
        margin: 10px 0;
        padding: 12.5px;
        background-color: #fff;
        border: 1px solid #bde;
        border-radius: 5px;
        box-shadow: 2.5px 5px 5px 0 #0002;
        overflow: overlay;
        z-index: 1;
    }

    #jw-helper h2 {
        margin: 10px 0 5px 0;
        color: #069;
        font-size: 1.4em;
        text-align: center;
        z-index: 1;
        user-select: none;
    }

    #jw-helper .component h3 {
        margin: 0 0 10px 0;
        color: #069;
        font-size: 1.2em;
        text-align: left;
        z-index: 1;
    }

    #jw-helper .footer {
        color: #888;
        font-size: 0.8em;
        text-align: center;
        z-index: 1;
    }

    #jw-helper .component>div {
        margin-top: 5px;
    }

    #jw-helper .tip {
        padding: 5px 0;
        color: #444;
        text-align: center;
    }

    #jw-helper table {
        width: 100%;
        border-collapse: collapse;
    }

    #jw-helper .qkAdd{
        font-size: 12px;
    }

    #jw-helper th,
    #jw-helper td {
        padding: 2.5px 5px;
        border: 1px solid #bde;
        text-align: center;
    }

    #jw-helper th {
        background-color: #eff;
    }

    #jw-helper label {
        margin-right: 10px;
    }

    #jw-helper select {
        width: 10em;
        padding: 5px;
        border: 1px solid #bde;
        border-radius: 5px;
        cursor: pointer;
    }

    #jw-helper ul {
        list-style-type: disc;
        margin-left: 20px;
        padding-left: 0;
    }

    #jw-helper button {
        padding: 5px 10px;
        background-color: #fff;
        border: 1px solid #bde;
        border-radius: 5px;
        text-align: center;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    #jw-helper button:hover {
        background-color: #eee;
    }

    #jw-helper button:disabled,
    #jw-helper select:disabled {
        cursor: not-allowed;
    }
</style>
`);

    class LoopRequester {
        static session = {
            meta: {
                url: null, // GET 请求 URL（字符串）
                params: null, // GET 请求的查询字符串参数（对象）
            },
            lastResponseAt: null, // 上次收到响应的时间
            responseMap: {}, // 响应的历史记录（响应的 message 字段=>出现的次数）
            hasSuccess: false, // 是否出现过 success 字段为真的响应
            totalSend: 0, // 发送计数
            totalDone: 0, // 完成计数
            totalFail: 0  // 失败计数
        }

        static interval = 200; // 两次请求的间隔（毫秒）
        static concurrent = 5; // 同时挂起的请求的最大数量
        static loopId = null; // 用于存储当前的 setInterval ID

        // 发送请求
        static sendRequest(url, params, successFunc, failFunc) {
            const xhr = new originalXHR();
            //POST请求
            xhr.open("POST", url, true);
            xhr.send(params);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        successFunc(JSON.parse(xhr.response));
                    } else {
                        failFunc();
                    }
                }
            };
        }
        // 启动请求循环
        static start(url, params) {
            // 确保没有循环链正在运行
            LoopRequester.stop();
            LoopRequester.session.meta = {
                url: url,
                params: params
            }

            const onSend = () => {
                if (LoopRequester.isTargetChanged(url, params)) {
                    return;
                }
                LoopRequester.session.totalSend += 1;
            }

            const onFail = () => {
                if (LoopRequester.isTargetChanged(url, params)) {
                    return;
                }
                LoopRequester.session.totalFail += 1;
            }

            const onResponse = (rsp) => {
                if (LoopRequester.isTargetChanged(url, params)) {
                    return;
                }
                LoopRequester.session.totalDone += 1;
                // 记录响应时间
                LoopRequester.session.lastResponseAt = new Date();
                // 更新历史记录
                if (rsp.success === undefined && rsp.flag1 !== undefined) {
                    rsp.message = "登录可能已失效，请重新进入";
                }
                if (rsp.message in LoopRequester.session.responseMap) {
                    LoopRequester.session.responseMap[rsp.message] += 1;
                } else {
                    LoopRequester.session.responseMap[rsp.message] = 1;
                }
                // 检查是否有 success 字段且值为 true
                if (rsp.message && rsp.message.indexOf("操作成功") > -1) {
                    LoopRequester.session.hasSuccess = true;
                }
            };

            // 立即执行首次请求
            LoopRequester.sendRequest(url, params, onResponse, onFail);
            onSend();

            // 启动循环链
            LoopRequester.loopId = setInterval(function () {
                // 检查 meta 字段是否发生变化
                if (LoopRequester.isTargetChanged(url, params)) {
                    LoopRequester.stop(); // 如果 meta 变更，停止循环链
                    return;
                }
                // 检查是否超过最大挂起请求限制
                if (LoopRequester.isExceededConcurrentLimit()) {
                    return; // 跳过本次循环
                }
                // 发送请求
                LoopRequester.sendRequest(url, params, onResponse, onFail);
                onSend();
            }, LoopRequester.interval);
        }

        // 停止请求循环
        static stop() {
            // 将类静态成员 session 重置
            LoopRequester.session = {
                meta: {
                    url: null,
                    params: null
                },
                lastResponseAt: null,
                responseMap: {},
                hasSuccess: false,
                totalSend: 0,
                totalDone: 0,
                totalFail: 0
            };

            // 清除 setInterval
            if (LoopRequester.loopId !== null) {
                clearInterval(LoopRequester.loopId);
                LoopRequester.loopId = null;
            }
        }

        static isStopped() {
            return !LoopRequester.session.meta || !LoopRequester.session.meta.url;
        }

        static isTargetChanged(url, params) {
            return LoopRequester.isStopped() ||
                LoopRequester.session.meta.url !== url ||
                JSON.stringify(LoopRequester.session.meta.params) !== JSON.stringify(params);
        }

        static isExceededConcurrentLimit() {
            if (LoopRequester.concurrent < 1) {
                return false;
            }
            const s = JSON.parse(JSON.stringify(LoopRequester.session));
            return s.totalSend - s.totalDone - s.totalFail >= LoopRequester.concurrent;
        }
    }


    //
    class GUIPanel {

        static $panel = null;
        static init() {
            const $panel = $(`
<div id="jw-helper">
    <div id="jw-helper-header" class="bg"></div>
    <h2>HITsz JW Helper</h2>

    <div class="component">
        <h3>课程列表</h3>
        <table id="ClassTable">
            <thead>
                <tr>
                    <th>序号</th>
                    <th>课程名称</th>
                    <th>上课信息</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
        <p class="tip">点击相应分类以获取课程列表</p>
    </div>

    <div class="component">
        <h3>当前状态</h3>
        <div>
            <span>状态：</span>
            <span id="qkStatus">--</span>
            <button id="qkStop" style="float:right">停止</button>
        </div>
        <div>
            <span>时钟：</span>
            <span id="qkClock">--</span>
        </div>
        <div>
            <span>延迟：</span>
            <span id="qkLatency">--</span>
        </div>
        <div>
            <span>统计：</span>
            <span id="qkStats">--</span>
        </div>
        <div>
            <span>响应：</span>
            <ul id="qkLog"></ul>
        </div>
    </div>

    <div class="component">
        <h3>高级设置</h3>
        <div>
            <label for="qkFrequency">请求频率：</label>
            <select class="qkSetting" id="qkFrequency">
                <option value="100">每秒 10 次</option>
                <option value="125">每秒 8 次</option>
                <option value="167">每秒 6 次</option>
                <option value="200" selected>每秒 5 次</option>
                <option value="250">每秒 4 次</option>
                <option value="333">每秒 3 次</option>
                <option value="500">每秒 2 次</option>
                <option value="1000">每秒 1 次</option>
                <option value="5000">每 5 秒 1 次</option>
                <option value="10000">每 10 秒 1 次</option>
                <option value="30000">每 30 秒 1 次</option>
                <option value="60000">每 60 秒 1 次</option>
            </select>
        </div>
        <div>
            <label for="qkConcurrent">并发限制：</label>
            <select class="qkSetting" id="qkConcurrent">
                <option value="-1">无限制（慎用）</option>
                <option value="50">50 个请求</option>
                <option value="20">20 个请求</option>
                <option value="10">10 个请求</option>
                <option value="5" selected>5 个请求</option>
                <option value="4">4 个请求</option>
                <option value="3">3 个请求</option>
                <option value="2">2 个请求</option>
                <option value="1">1 个请求</option>
            </select>
        </div>
    </div>

    <p class="footer">Source: https://github.com/isHarryh/USTB-Awesome-JS</p>
</div>
`);
            $("body").append($panel);
            $("head").append($style);

            function makeDraggable($ele, initX, initY) {
                // https://www.w3schools.com/howto/howto_js_draggable.asp

                let pos1 = 0,
                    pos2 = 0,
                    pos3 = 0,
                    pos4 = 0;

                $ele.css({
                    top: initY,
                    left: initX,
                });

                const dragMove = (e) => {
                    e.preventDefault();
                    pos1 = pos3 - e.clientX;
                    pos2 = pos4 - e.clientY;
                    pos3 = e.clientX;
                    pos4 = e.clientY;
                    $ele.css({
                        top: $ele.position().top - pos2,
                        left: $ele.position().left - pos1,
                    });
                };

                const dragFinish = (e) => {
                    $(document).off("mouseup", dragFinish);
                    $(document).off("mousemove", dragMove);
                };

                const dragMouseDown = (e) => {
                    e.preventDefault();
                    pos3 = e.clientX;
                    pos4 = e.clientY;
                    $(document).on("mouseup", dragFinish);
                    $(document).on("mousemove", dragMove);
                };

                let $header = $("#" + $ele.attr("id") + "-header");
                if ($header.length) {
                    $header.on("mousedown", dragMouseDown);
                } else {
                    $ele.on("mousedown", dragMouseDown);
                }
            }


            LoopRequester.interval = parseInt($('#qkFrequency').val(), 10);
            $('#qkFrequency').on('change', function () {
                var newInterval = parseInt($(this).val(), 10);
                LoopRequester.interval = newInterval;
                console.log("🆗 Set interval to " + newInterval + " ms.");
            });
            LoopRequester.concurrent = parseInt($('#qkConcurrent').val(), 10);
            $('#qkConcurrent').on('change', function () {
                var newConcurrent = parseInt($(this).val(), 10);
                LoopRequester.concurrent = newConcurrent;
                console.log("🆗 Set concurrent limit to " + newConcurrent);
            });
            $('#qkStop').on('click', () => {
                LoopRequester.stop();
                $('.qkSetting').prop('disabled', false);
                console.log("🚩 Stop loop request.");
            });

            makeDraggable($panel, 10, 10);

            console.log("start");
            GUIPanel.$panel = $panel;
        }

        static updateStatus(session) {
            // 更新抢课状态
            let statusText = "";
            if (session.meta && session.meta.url) {
                if (session.hasSuccess) {
                    statusText = "正在抢课（已成功）";
                } else {
                    statusText = "正在抢课";
                }
            } else {
                statusText = "空闲中";
            }
            $('#qkStatus').text(statusText);

            // 更新本地时间显示
            const now = new Date();
            $('#qkClock').text(now.toLocaleTimeString('zh-CN', { hour12: false }));

            // 更新延迟状态
            const $latency = $("#qkLatency");
            // 若 lastResponseAt 不存在，则认为未收到响应
            const nowTime = now.getTime();
            const lastTime = session.lastResponseAt ? new Date(session.lastResponseAt).getTime() : 0;
            const delay = nowTime - lastTime;

            let latencyText = "";
            if (!session.meta || lastTime <= 0 || delay < 0) {
                latencyText = "⚪ --";
            } else if (delay < 400) {
                latencyText = "🟢 流畅";
            } else if (delay < 1000) {
                latencyText = "🟡 一般";
            } else {
                latencyText = "🔴 阻滞";
            }
            if (delay >= 2000 && delay < 999.9 * 1000) {
                latencyText += "（已有 " + (delay / 1000).toFixed(1) + " 秒未收到响应）";
            }
            $latency.text(latencyText);

            // 显示响应历史记录
            const $qkLog = $('#qkLog');
            $qkLog.empty();
            $.each(session.responseMap, function (message, count) {
                const itemText = "收到 " + count + " 次： " + message;
                $("<li></li>").text(itemText).appendTo($qkLog);
            });

            // 显示统计信息
            const $qkStats = $('#qkStats');
            $qkStats.text(
                "发送 " + session.totalSend + "，" +
                "接收 " + session.totalDone + "，" +
                "丢失 " + session.totalFail + "，" +
                "挂起 " + (session.totalSend - session.totalDone - session.totalFail)
            );
        }

    }
    // 等待DOM加载完成后启动
    $(document).ready(function () {
        GUIPanel.init();
        setInterval(() => {
            GUIPanel.updateStatus(LoopRequester.session);
        }, 150);
    });
})();
