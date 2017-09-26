/**
 * Created by zhangcheng on 25/09/2017.
 * 上传图片组件
 */

;(function ($, window, document, undefined) {
    var uploadImg = function (el, options, uploadCallback, confirmCallback) {
        this.$el = el;
        this.uploadCallback = uploadCallback;
        this.confirmCallback = confirmCallback;
        this.defaults = {
            // 主题设置
            theme: {
                title: '上传门店图片', // 标题
                uploadBtnText: '上传图片', // 上传按钮文字
                okBtnText: '确定' // 确认按钮文字
            },
            type: 'png', // 希望返回什么图片类型，默认为png
            multiSelect: false, // 是否支持多选
            // 图片限制条件
            limit: {
                width: 0, // 限制宽度必须是该宽度，0为不限制
                height: 0, // 限制高度必须是该高度，0为不限制
                isSquare: false, // 是否限制为正方形就可以
                size: 0, // 限制上传图片大小，0为不限制
                quality: 1, // 图片压缩的质量 0.1~1 1为不压缩 当type为jpg或者jpeg时候才生效
                scale: 1  // 图片缩放比例
            }
        };
        this.options = $.extend({}, this.defaults, options);
        this.selectImgList = [];
        this.html = `<div class="x-upload-box">
                        <header>
                            <h3>${this.options.theme.title}</h3>
                            <i class="x-close-icon-btn" data-type="js-close-icon-btn"></i>
                        </header>
                        <section>
                            <button class="x-file-input-box" data-type="js-upload-file-input">
                                ${this.options.theme.uploadBtnText}
                                <input id="upload-file-input" type="file" accept="image/jpeg,image/jpg,image/png" name="imageFile">
                            </button>
                    
                            <ul class="x-upload-img-list"></ul>
                        </section>
                        <footer>
                            <button class="x-confirm-btn" data-type="js-confirm-select-btn">${this.options.theme.okBtnText}</button>
                        </footer>
                    </div>`;
    }


    uploadImg.prototype = {
        /**
         * 显示黑色半透明遮罩层
         * */
        showMask: function () {
            var html = `<div class="x-mask"></div>`;
            $('body').css('overflow', 'hidden').append(html);
            setTimeout(function () {
                $('.x-mask').addClass('-show');
            }, 10)
        },
        /**
         * 清除黑色半透明遮罩层
         * */
        removeMask: function () {
            $('.x-mask').removeClass('-show');
            $('body').css('overflow', 'auto');
            setTimeout(function () {
                $('.x-mask').remove();
            }, 200)
        },
        /**
         * 初始化图片选择插件
         * 先将元素插入，再添加出现动画
         * */
        init: function () {
            this.showMask();
            $('body').append(this.html);
            this.initImgList();
            setTimeout(function () {
                $('.x-upload-box').addClass('-show');
            }, 10);
        },
        /**
         * 初始化图片列表，如果上传一张图片后，请调用下该方法，把先上传图片加入到图片列表中
         * */
        initImgList: function () {
            var imgList = this.getLocalStorage(),
                listDom = [];

            for (var i = 0; i < imgList.length; i++) {
                listDom.push(`<li class=${i === 0 ? '-active' : ''}>
                                    <img src=${imgList[i]} data-type="js-select-img" width="100%" height="100%" alt="上传图片">
                                </li>`);
            }
            this.selectImgList = [];
            this.selectImgList.push(imgList[0]);
            $('.x-upload-box ul.x-upload-img-list').html(listDom.join(''));
        },
        /**
         * 点击选择图片
         * @param event 选中图片的信息
         * */
        selectImg: function (event) {
            var url = event.getAttribute('src'),
                index = this.selectImgList.indexOf(url);
            // 多选
            if (this.options.multiSelect) {
                if (index === -1) {
                    this.selectImgList.push(url);
                    event.parentNode.className = '-active';
                    return;
                }

                this.selectImgList.splice(index, 1);
                event.parentNode.className = '';
            } else { // 单选
                this.selectImgList = [];
                this.selectImgList.push(url);

                // 循环图片列表，把选中状态移除
                event.parentNode.parentNode.childNodes.forEach(function (el) {
                    el.className = '';
                });
                event.parentNode.className = '-active';
            }
        },
        /**
         * 数组去重
         * @param arry 需要去重的数组
         * */
        removeArryRepeat: function (arry) {
            var res = [];
            var json = {};
            for (var i = 0; i < arry.length; i++) {
                if (!json[arry[i]]) {
                    res.push(arry[i]);
                    json[arry[i]] = 1;
                }
            }
            return res;
        },
        /**
         * 摧毁图片选择插件
         * 当消失动画结束后，从dom树中删除
         * */
        destroy: function () {
            $('.x-upload-box').removeClass('-show');
            this.removeMask();
            this.unbindEvent();
            setTimeout(function () {
                $('body').find(".x-upload-box").remove();
                this.html = null;
            }, 600);
        },
        /**
         * 从dom中移除元素前，解除之前的绑定时间
         * 删除的只是DOM结构，内存中依旧保存着数据。所以要手动将DOM占用的内存清空。
         * */
        unbindEvent: function () {
            $('.x-upload-box').unbind('click');
            $('#upload-file-input').unbind('change');
        },
        /**
         * 绑定函数
         * */
        bindEvent: function () {
            var that = this;
            that.$element = $('.x-upload-box');

            that.$element.on('change', '#upload-file-input', function (event) {
                that.readFiles(event);
            });
            // 根据data-type 绑定对应的事件
            that.$element.on('click', function (event) {
                switch (event.target.getAttribute("data-type")) {
                    case 'js-close-icon-btn':
                        that.destroy();
                        break;
                    case 'js-upload-file-input':
                        event.target.childNodes[1].click();
                        break;
                    case 'js-select-img':
                        that.selectImg(event.target);
                        break;
                    case 'js-confirm-select-btn':
                        that.confirm(event);
                        break;
                    default:
                        break;
                }
            });
        },
        /**
         * 读取文件
         * */
        readFiles: function (event) {
            var that = this,
                file = event.currentTarget.files[0];
            // 创建 FileReader 对象 并调用 render 函数来完成渲染.
            var reader = new FileReader();
            // 绑定load事件自动回调函数
            reader.onload = function (e) {
                // 调用前面的 render 函数
                that.checkUploadImg(file, e.target.result);
            };
            // 读取文件内容
            reader.readAsDataURL(file);
        },
        /**
         * 检测选择图片是否符合限制规则
         * */
        checkUploadImg: function (file, url) {
            var that = this,
                image = new Image();

            image.src = url;//指定Image的路径
            image.onload = function () {
                var imgWidth = image.width,
                    imgHeight = image.height,
                    fileSize = file.size / 1024;

                if (that.options.limit.isSquare && (imgWidth !== imgHeight)) { // 检测是否是正方形
                    that.fileChange({
                        success: false,
                        state: 3,
                        message: '请上传正方形图片',
                    });
                    return;
                } else if (that.options.limit.width && (that.options.limit.width !== imgWidth)) { // 检测是否与指定宽度一致
                    that.fileChange({
                        success: false,
                        state: 1,
                        message: '请上传指定宽度的图片',
                    });
                    return;
                } else if (that.options.limit.height && (that.options.limit.height !== imgHeight)) { // 检测是否与指定高度一致
                    that.fileChange({
                        success: false,
                        state: 2,
                        message: '请上传指定高度的图片',
                    });
                    return;
                } else if (that.options.limit.size && (fileSize > that.options.limit.size)) { // 检测上传图片比限制的图片小
                    that.fileChange({
                        success: false,
                        state: 2,
                        message: '请上传小于' + that.options.limit.size + '的图片',
                    });
                    return;
                } else {
                    that.transformationBase64(this, imgWidth, imgHeight);
                }
            };
        },
        /**
         * 将file文件转换为base64
         * */
        transformationBase64: function (img, width, height) {
            var canvas = document.createElement('canvas'),
                ctx = canvas.getContext('2d'),
                base64Url = '';
            canvas.width = this.options.limit.scale * width;
            canvas.height = this.options.limit.scale * height;
            canvas.style.width = this.options.limit.scale * width;
            canvas.style.height = this.options.limit.scale * height;
            ctx.drawImage(img, 0, 0, width, height, 0, 0, this.options.limit.scale * width, this.options.limit.scale * height);
            if (this.options.type === 'png') { // 当png时候，对图片进行压缩
                base64Url = canvas.toDataURL('image/png');
            } else { // 当jpg时候，对图片进行压缩
                base64Url = canvas.toDataURL('image/jpeg', this.options.limit.quality);
            }

            this.fileChange({
                success: true,
                state: 200,
                message: '上传转换成功',
                base64Url: base64Url
            });
        },
        /**
         * 当文件选择后，执行回调函数，把上传的内容传出去
         * */
        fileChange: function (data) {
            this.uploadCallback && this.uploadCallback(data);
        },
        /**
         * 从localStorage中取出之前存储的图片
         * @param url 图片链接
         * */
        getLocalStorage: function () {
            var imgList = [], imgListString = window.localStorage.getItem('imgList');
            if (imgListString) {
                imgList = JSON.parse(imgListString);
            }
            return imgList;
        },
        /**
         * 上传完后，把图片链接保存在本地，下次可以直接使用
         * @param url 图片链接
         * */
        saveToLocalStorage: function (url) {
            var imgList = this.getLocalStorage();
            imgList.splice(0, 0, url);
            // 首先先将保存的图片进行数组去重,去重后再存储到local中
            window.localStorage.setItem('imgList', JSON.stringify(this.removeArryRepeat(imgList)));
        },
        /**
         * 点击确认按钮后的回调函数
         * */
        confirm: function () {
            this.confirmCallback && this.confirmCallback(this.selectImgList);
        },
    }

    $.fn.jQueryUploadImg = function (options, uploadCallback, confirmCallback) {
        var myPlugin = new uploadImg(this, options, uploadCallback, confirmCallback);
        myPlugin.init();
        myPlugin.bindEvent();
        return myPlugin;
    }

})(jQuery, window, document);