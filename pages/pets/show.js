// pages/pets/show.js
const app = getApp()
Page({

  data: {
		neuteredDisplay: '',
		vaccinatedDisplay:'',
		specialNeedDisplay: '',
		adoptOnly: '', 
		current_user: {}, 
		userImage: '',
		userName: '',
    userWechatId: '',
    isBooker: false,
		bookingId: null,
		showWindow: false,
		favorites: '',
  },

  onLoad(options) {
		this.setData({
      content: wx.getStorageSync('content'),
      petId: options.id
    })
    console.log('from onLoad -> ', options)
  },

  onReady() {

  },

  getData() {
		let page = this
		let id = page.options.id
    wx.request({
      header: app.globalData.header,
      url: `${app.globalData.baseURL}/pets/${id}`,
      success(res) {
        if (res.statusCode === 200) {
					const pet = res.data.pet;
					const my_booking = res.data.my_booking;
					const current_user = res.data.current_user;
					const isBooker = my_booking? my_booking.user_id === current_user.id : false;
					// const isAdmin = current_user.admin? true : false;
					const isAdmin = current_user.role === "admin";
					let neuteredDisplay = pet.neutered ? 'yes' : 'no';
					let vaccinatedDisplay = pet.vaccinated ? 'yes' : 'no';
					let specialNeedDisplay = pet.special_need ? 'yes' : 'no';
					let adoptOnly = pet.adoptable? 'true': 'false';
          page.setData({
						pet: pet,
						neuteredDisplay: neuteredDisplay,
						vaccinatedDisplay: vaccinatedDisplay,
						specialNeedDisplay: specialNeedDisplay,
						adoptOnly: adoptOnly,
						current_user: current_user, 
						isBooker: isBooker,
						isAdmin: isAdmin,
						content: app.globalData.content,
						bookings: res.data.my_booking,
					})
					console.log('from pet/show, res.data->', res.data)
					console.log("isbooker", isBooker, "isAdmin", isAdmin)
        }
      }
		})
		
		wx.request({
			header: app.globalData.header,
			url: `${app.globalData.baseURL}/pets/${id}/bookings`,
			success(res) {
				if (res.statusCode === 200) {
					const favorites = res.data
					page.setData({
						favorites: favorites,
					})
				}
				console.log('favorites->', res.data)
			}
			
		})
  },

  onShow() {
		this.setData({
			content: app.globalData.content
		})
    if (app.globalData.header) {
			this.getData()
    } else {
			wx.event.on('loginFinished', this, this.getData)
    }
	},

	handleGetUserInfo(e) {
		let userInfo = e.detail.userInfo
		if (userInfo) {
			this.setData({
				userName: userInfo.nickName,
				userWechatId: userInfo.openId,
				userImage : userInfo.avatarUrl
			})
		}
		console.log("user info -> ", userInfo)
  },

	clickNeed(e) {
		this.setData({
			showWindow: true,
		})
	},

	hideWindow(e) {
		console.log('e.target.dataset', e.target.dataset)
		if (e.target.dataset.target == "self")
			this.setData({
				showWindow: false,
			})
	},

	preventTouchMove(){},

	toggleBooking(e) {
		let page = this
		page.getData()
    // If pet is already favorited
		if (page.data.isBooker) {
      wx.showModal({
        title: 'Note!',
				content: 'Remove from favorites?',
				confirmText: 'Yes',
				cancelText: 'No',
        complete: (res) => {
          if (res.cancel) {
          }
          if (res.confirm) {
            wx.request({
              url: `${app.globalData.baseURL}/bookings/${page.data.bookings.id}`,
              method: 'DELETE',
              header: app.globalData.header,
              success(res) {
                if (res.statusCode === 200) {
                  console.log("booking removed")
                  page.setData({
                    isBooker: false,
                    bookingId: null
                  })
                  wx.showToast({
                    title: "Unfavorited :(",
                    duration: 1000
                  })  
                } else {
                  console.log("From show.js: status code is", res.statusCode)
                  wx.showToast({
                    title: 'You can favorite a maximum of 10 pets!',
                  })
                }
              }
            })
          }
        }
      })
    // If pet is not favorited yet
		} else {
		let page = this
		let date = Date.now()
		console.log ('From Favorite Btn: page.data', page.data)
		wx.request({
			url: `${app.globalData.baseURL}/pets/${this.data.pet.id}/bookings`,
			header: app.globalData.header,
			method: "POST",
			data: {
				created_at: date, 
				name: this.data.userName,
				wechat_id: this.data.userWechatId,
				image: this.data.userImage
			},
			success(res) {
				if (res.statusCode === 201) {
					page.setData({
						isBooker: true,
						bookingId: res.data.id
					})
					wx.showToast({
						title: 'Favorited!',
						duration: 1000
					})	
					console.log('booking success!, booking.id ->', res.data.booking.id)
					console.log("From show.js : res.data", res.data)
				} else {
					console.log("From show.js: status code is", res.statusCode)
					if (res.statusCode === 422)
					wx.showToast({
						title: "Error",
					})
				}
			}
    })
    }
	},

	handleContact (e) {
		console.log(e.detail.path)
		console.log(e.detail.query)
	},

  edit(e) {
    wx.setStorageSync('editId', this.data.pet.id)
    wx.switchTab({
      header: app.globalData.header,
      url: "form"
    })
    console.log('from pet/show, editId is ->', this.data.pet.id)
  },

  delete(e) {
    let id = this.data.pet.id
    wx.showModal({
      title: 'Note!',
      content: 'Are you sure to delete this post?',
      cancelText: 'No',
      confirmText: 'Yes',
      success(res) {
        if (res.confirm) {
          wx.request({
            header: app.globalData.header,
            url: `${app.globalData.baseURL}/pets/${id}`,
            method: 'DELETE',
            success(res){
              wx.showToast({
                title: 'Deleted!',
                duration: 1000,
                success(resolve) {
                  setTimeout(() => {
                    wx.switchTab({
                      url: '/pages/pets/index',
                    })
                  }, 1000)
                }
              })
            }
          })
        } else {
        }
      }
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
    return {
      name: this.data.pet.name,
      image_url: this.data.pet.image_url,
      path: `pages/pets/show?id=${this.options.id}`
    }
  }
})