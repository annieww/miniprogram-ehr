// pages/admin/profile.js
let app = getApp()
Page({
  data: {
    requested_users: [],
  },
  onLoad(options) {
		if(app.globalData.header) {
			this.getData()
		}else{
			wx.event.on('loginFinished', this, this.getData)
		}
	},

	getData() {
		let page = this
		wx.request({
			header: app.globalData.header,
			url: `${app.globalData.baseURL}/admin`,
			success(res){
				const requested_users = res.data
				page.setData({
					requested_users
				})
				console.log("requested_users -> ", requested_users)
			}
		})
  },

	navigateToPetShowPage: function (e) {
		console.log(e)
    let petId = e.currentTarget.dataset.petId;
    wx.navigateTo({
			url: `/pages/pets/show?id=${petId}`,
		})
  },

  onReady() {

  },

  onShow() {
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()){
      this.getTabBar().setData({
        selectedTabIndex: 4
      })
    }
    this.setData({
      content: app.globalData.content
    })
  },

  onHide() {

  },

  onUnload() {

  },

  onPullDownRefresh() {

  },

  onReachBottom() {

  },

  onShareAppMessage() {

  },

  active_request() {
    this.setData({
      active_tab: "request"
    })
  },
})