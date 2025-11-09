/**
 * "记住我"功能测试脚本
 * 在浏览器控制台中运行此脚本来测试功能
 */

// 测试函数：检查存储位置
function testRememberMe() {
  console.log('=== "记住我"功能测试 ===\n')

  // 1. 检查当前存储状态
  console.log('1. 检查当前存储状态:')
  const localToken = localStorage.getItem('token')
  const sessionToken = sessionStorage.getItem('token')
  const localUserInfo = localStorage.getItem('userInfo')
  const sessionUserInfo = sessionStorage.getItem('userInfo')

  console.log('   LocalStorage token:', localToken ? '存在' : '不存在')
  console.log('   SessionStorage token:', sessionToken ? '存在' : '不存在')
  console.log('   LocalStorage userInfo:', localUserInfo ? '存在' : '不存在')
  console.log('   SessionStorage userInfo:', sessionUserInfo ? '存在' : '不存在')

  // 2. 判断当前是哪种存储方式
  console.log('\n2. 当前存储方式:')
  if (localToken) {
    console.log('   ✅ 使用 LocalStorage（持久化存储）- 已勾选"记住我"')
  } else if (sessionToken) {
    console.log('   ✅ 使用 SessionStorage（会话级存储）- 未勾选"记住我"')
  } else {
    console.log('   ⚠️  未登录或 token 已清除')
  }

  // 3. 检查存储一致性
  console.log('\n3. 存储一致性检查:')
  if (localToken && sessionToken) {
    console.log('   ⚠️  警告：token 同时存在于 localStorage 和 sessionStorage，这不应该发生')
  } else if (localToken || sessionToken) {
    console.log('   ✅ 存储位置正确（只在一个位置存在）')
  }

  if (localUserInfo && sessionUserInfo) {
    console.log('   ⚠️  警告：userInfo 同时存在于 localStorage 和 sessionStorage，这不应该发生')
  } else if (localUserInfo || sessionUserInfo) {
    console.log('   ✅ userInfo 存储位置正确')
  }

  // 4. 测试清除功能
  console.log('\n4. 清除功能测试:')
  console.log('   运行 clearAllStorage() 可以清除所有存储')

  console.log('\n=== 测试完成 ===')
}

// 清除所有存储
function clearAllStorage() {
  console.log('清除所有存储...')
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('userInfo')
  console.log('✅ 已清除所有存储')
  console.log('请刷新页面')
}

// 模拟登录（仅用于测试，实际应该通过登录接口）
function simulateLogin(rememberMe = false) {
  console.log(`模拟登录（记住我: ${rememberMe ? '是' : '否'}）...`)

  const testToken = 'test-token-' + Date.now()
  const testUserInfo = JSON.stringify({
    id: 'test-id',
    username: 'test-user',
    email: 'test@example.com'
  })

  if (rememberMe) {
    localStorage.setItem('token', testToken)
    localStorage.setItem('userInfo', testUserInfo)
    console.log('✅ Token 已存储到 LocalStorage（持久化）')
  } else {
    sessionStorage.setItem('token', testToken)
    sessionStorage.setItem('userInfo', testUserInfo)
    console.log('✅ Token 已存储到 SessionStorage（会话级）')
  }

  console.log('请运行 testRememberMe() 验证存储位置')
}

// 导出测试函数（在浏览器控制台中使用）
if (typeof window !== 'undefined') {
  window.testRememberMe = testRememberMe
  window.clearAllStorage = clearAllStorage
  window.simulateLogin = simulateLogin

  console.log('✅ 测试函数已加载到全局作用域')
  console.log('可用函数:')
  console.log('  - testRememberMe()  : 测试当前存储状态')
  console.log('  - clearAllStorage()  : 清除所有存储')
  console.log('  - simulateLogin(true)  : 模拟登录（勾选记住我）')
  console.log('  - simulateLogin(false) : 模拟登录（不勾选记住我）')
}
