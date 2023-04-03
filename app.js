// app.js
import event from './utils/event';
wx.event = event;
import zh from '/utils/zh'
import en from '/utils/en' 

App({
  globalData: {
    userInfo: '',
		header: null,
		user: {},
		baseURL: "https://new-ehr.petiteapp.cloud/api/v1", 
		// baseURL: "http://localhost:3000/api/v1",
		language: wx.getStorageSync('language'),
		role: ''
	}, 

  onLaunch() {
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
		const app = this
		let isLogin = false
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        wx.request({
          url: `${app.globalData.baseURL}/login`,
          method: 'post',
          data: { code: res.code }, // pass code in request body
          success(loginRes) {
						app.globalData.header = loginRes.data.headers
						app.globalData.user = loginRes.data.user
						app.globalData.userId = loginRes.data.user.id
						let role;
						console.log('loginRes.data -> ', loginRes.data)
						if(loginRes.data.user.role === 'admin'){
							role = 'admin';
							wx.setStorageSync('role', 'admin')
						} else if(loginRes.data.user.role === 'user') {
							role = 'user';
							wx.setStorageSync('role', 'user')
						} else {
							role = 'user';
							wx.setStorageSync('role', 'user')
						} 
						app.globalData.role = role
						console.log('app.globalData.role ->', app.globalData.role)
						event.emit('loginFinished') }
						
				})
				isLogin = true
				console.log('from app.js, isLogin ->', isLogin)
      }
    }),
		this.updateContent()
  },
  updateContent() {
    let lastLanguage = wx.getStorageSync('language') // identify the current language
    if (lastLanguage == 'en') {
      this.globalData.content = en.content // sets the language according to current language setting
      wx.setStorageSync('language', 'en') // keeps the language setting
    } else {
      this.globalData.content = zh.content
      wx.setStorageSync('language', 'zh')
    }
  }, 
  changeLanguage() {
    let language = wx.getStorageSync('language') // identify the current language
    if (language == 'zh') {
      wx.setStorageSync('language', 'en') // change the language
    } else {
      wx.setStorageSync('language', 'zh')
    }
    this.updateContent()
	}
})
