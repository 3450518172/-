// preload.js
// 这个脚本会直接注入到抖音网页的骨子里
window.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', (e) => {
    // 寻找被点击的 a 标签
    const el = e.target.closest('a[href]');
    if (!el) return;
    
    const href = el.getAttribute('href');
    
    // 🎯 核心死守：只要发现是以字节系私有协议开头的链接
    if (/^((bytedance|snssdk|tiktok|douyin):\/\/)/i.test(href)) {
      e.preventDefault();  // 1. 强行扼杀点击事件，不让它传给系统
      e.stopPropagation(); // 2. 阻止事件冒泡
      console.log('【Preload 成功拦截 <a> 标签跳转】:', href);
    }
  }, true); // 使用事件捕获阶段，确保比抖音自带的脚本执行得更快
});