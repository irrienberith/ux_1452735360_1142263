# 帆软iOS移动端集成说明
## 一般集成
##### 引入第三方库：
1. AFNetworking
2. UIKit+AFNetworking
3. XGPush
4. BaiduMap
5. WeiXinSDK

##### 引入帆软数据分析包：FineSoft.framework
##### 引入图片库：IFImages.xcassets
##### 引入其他资源库：FineResource.bundle
##### 开放API说明：
* IFIntegrationUtils：提供登录，登出服务器；获取目录树；收藏夹的方法；创建离线所需要的表；
* IFEntryNode：获取目录树/收藏夹方法返回的节点对象，可以从中取到获取节点的个各种信息，例如名称，是否是文件夹，子节点等
* IFEntryViewController：报表视图，可以根据IFEntryNode对象创建；也可以根据报表路径直接创建
* IFFrameDirectoryViewController：目录树视图，可以根据IFIntegrationUtils获取的目录树创建
* IFOEMUtils：用于定制App，例如更换默认服务器，自定义目录树右上角设置按钮，自定义消息提醒方式，更换关于界面里的图标等
* IFAppDelegate：OEM集成时，项目的Delegate继承该Delegate
* IFFrameAppSettingViewController：FR内置的设置界面，包括离线查看，离线填报相关的设置。
* IFFrameAppSettingItem：用于在FR内置设置界面中自定义设置条目，参数包括显示值和执行的block

## OEM集成
OEM需要引入的资源和包和一般集成相同；
OEM的原理是让定制开发的项目的AppDelegate继承FR移动端的AppDelegate（FineSoft/IFAppDelegate.h），在启动App前完成定制，可参考如下代码：

```
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    [IFOEMUtils setCopyright:@"test"];
    [IFOEMUtils removeDemoServer];
    [IFOEMUtils addServerWithName:@"MyServer" andURL:@"http://www.finereporthelp.com:8889/app/ReportServer" addUsername:@"demo" addPassword:@"123"];
    [super application:application didFinishLaunchingWithOptions:launchOptions];
    return YES;
}
```

## 示例
以上说明都可以在FRDemo工程中看到示例，在main.m类中，更改Delegate可以切换一般集成（AppDelegate）和OEM集成（AppDelegate4OEM）。

## 常见问题
**1.	如何根据报表路径创建带有参数的报表？**

	[IFEntryViewController initWithPath:(NSString *)reportPath serverUrl:(NSString *)serverUrl viewType:(IFEntryViewType)viewType parameters:(NSDictionary *) params];
	
	其中：
		reportPath为报表的磁盘路径，如@"mobile/test.cpt"；
		serverUrl为报表所在服务器路径；viewType为报表类型，可分为IFEntryViewTypePage（分页）和IFEntryViewTypeWrite（填报），如果是表单可传nil；
		params为需要传递的参数，可为nil。

**2.	如果购买了决策系统，在移动端想查看决策系统的报表，又不想用FR默认的目录树结构，如何定制自己的目录树？**
	
	//第一步，登录服务器
	[IFIntegrationUtils logInto:DEFAULT_SERVERNAME serverUrl:url withUsername:username andPassword:password success:^{
        //第二步，登录成功，加载目录树
        [IFIntegrationUtils loadReportTree:^(NSArray *reportsArray) {
            //第三步，根据目录树和报表的树结构数组，创建自定义目录树，关于返回的数据结构在下面详细介绍。
        } failure:^(NSString *msg) {
        } isObj:YES];
    } failure:^(NSString *msg) {
    	//登录失败的处理
    }];
    下面详细介绍下服务器返回的目录树结构数组reportsArray：
    reportsArray数组里的元素类型都是IFEntryNode；
    IFEntryNode可以是文件夹，也可以是具体报表，可以通过方法[node isFolder]来判断；
    如果node是文件夹，可以通过[node children]方法来获取文件夹下的子元素数组，仍然为IFEntryNode的数组对象；
    如果node是报表类型，可以通过[[IFEntryViewController alloc] initWithEntry:node]的方式创建出报表视图控制器，并展示报表。    
	
**3.	如何获取决策系统里已经收藏的报表？**

	//第一步，登录服务器
	[IFIntegrationUtils logInto:DEFAULT_SERVERNAME serverUrl:url withUsername:username andPassword:password success:^{
        //第二步，登录成功，获取收藏夹报表数组
        [IFIntegrationUtils favorites:^(NSMutableArray *favorites) {
        	//第三步，根据收藏夹报表自定义展示页面
        } failure:^(NSString *message) {
        }];
    } failure:^(NSString *msg) {
    }];
    获取的收藏夹报表数组，一样全是IFEntryNode对象，可以采取一样的方式展示报表。

**4.	如何在集成的App里使用微信分享功能？**
	
可参考微信开放平台中的[iOS接入指南](https://open.weixin.qq.com/cgi-bin/showdocument?action=dir_list&t=resource/res_list&verify=1&id=1417694084&token=318a1b896444ad86edea95db354e2ffd8e35751e&lang=zh_CN)：

**5.	怎么登出服务器？**

	[IFIntegrationUtils logout];

**6.	OEM定制的App，都支持定制哪些内容？**

a.	因为OEM是一个新的工程，可以设置App的图标和名称，因此不需要调用额外的接口就能达到修改App图标和名称的目的；

b.	第一次打开App时，默认服务器列表的定制：
	
	1.	删除FR的默认服务器：
		
			[IFOEMUtils removeDemoServer];
	2.	增加一个默认服务器：
		
			[IFOEMUtils addServerWithName:(NSString *)serverName andURL:(NSString *)serverURL addUsername:(NSString *)username addPassword:(NSString *)password userEditable:(BOOL)userEditable];
	
			serverName：服务器名称；			
		
			serverURL：服务器地址；
		
			username：默认用户名（可为空）；
		
			password：默认密码（可为空）；
		
			userEditable：用户名，密码，以及服务器名称地址是否允许用户修改。
c.	关于页面的定制：
	
	1.	去除FR默认的关于页面：
		
			[IFOEMUtils removeAbout];
	2.	自定义关于页面上的信息：
		
			[IFOEMUtils setAppVersion:(NSString *) version];//设置版本号
			[IFOEMUtils setCopyright:(NSString *) copyRight];//设置版权信息
			[IFOEMUtils setAppIconName:(NSString *) iconName];//设置关于页面里的图标。

d.	App内默认消息提醒样式的定制：FR内默认消息提醒采用顶部出现会自动消失的蓝色（正常提示消息）或红色（错误/警告消息）提醒消息。如果想使用符合自己App风格的提示消息，可以使用：

		[IFOEMUtils setMessageHandler:(void (^) (NSString *message, BOOL isSuccess)) handler];
		message：消息内容；
		handler：消息处理函数（isSuccess：表示消息是否只是提醒消息。YES:只是提示；NO：错误/警告）。

e.	App右上角为设置按钮，支持放置自定义按钮：
	
		[IFOEMUtils setAppSettingBarButtonItem:(UIBarButtonItem *) settingItem];
		settingItem：设置按钮。
	
**7.	集成时如何支持报表离线预览**

首先，在AppDelegate中的didFinishLaunchingWithOptions方法创建离线所需要的数据库表：
	
	[IFIntegrationUtils createTable];
然后，使用第6个问题中，自定义右上角设置按钮的方式，创建自定义的设置按钮，点击事件打开FR内置的设置界面

	IFFrameAppSettingViewController *settingViewController = [[IFFrameAppSettingViewController alloc] initWithCustomItems:customItems];
	customItems:是个二维数组，设置界面中除了离线相关的按钮外，还可以自己添加按钮，元素类型为一组关联的设置按钮组，按钮类型为：IFFrameAppSettingItem。
	例如：添加一个注销按钮：
	IFFrameAppSettingItem *logoutItem = [[IFFrameAppSettingItem alloc] initWithTitle:@"注销" andAction:^(UITableViewCell *selectedCell) {
        [IFIntegrationUtils logOut];
        [self dismissViewControllerAnimated:YES completion:nil];
    }];
    NSArray *logOutSection = [[NSArray alloc] initWithObjects:logoutItem, nil];
    NSArray *customItems = [[NSArray alloc] initWithObjects:logOutSection, nil];
    IFFrameAppSettingViewController *settingViewController = [[IFFrameAppSettingViewController alloc] initWithCustomItems:customItems];
    
**8.	如何让App支持修改密码**

说明：如果用户是管理员，则任何时候可修改密码；如果服务器是同步数据集或者开启了http认证/ldap认证，则是不支持修改密码的。符合条件后，可以通过如下方式修改密码：
	
	//首先登录
	[IFIntegrationUtils logInto:DEFAULT_SERVERNAME serverUrl:url withUsername:username andPassword:password success:^{
		//登录成功后通过此方法获知服务器是否支持修改密码
        if([IFIntegrationUtils canChangePassword]) {
        	//这时候，需要2个参数，原始密码和新密码；这边可以写自己的修改密码让用户输入，比对2次输入是否相同等。假如这边已经拿到原始密码originalPassword和新密码newPassword，则调用
        	[IFIntegrationUtils changePassword:originalPassword newPassword:newPassword success:^{
        		//修改成功
    		} failure:^(NSString *message) {
    			//修改失败，旧密码有误
    		}];
        } else {
        	//服务器不支持修改密码
        }
    } failure:^(NSString *msg) {
    	//登录失败
    }];

**9.	如何在集成的App里支持信鸽推送？**

首先需要到[信鸽开发中心](http://developer.xg.qq.com/index.php/IOS_%E8%AF%81%E4%B9%A6%E8%AE%BE%E7%BD%AE%E6%8C%87%E5%8D%97)上注册自己的App，关于证书和程序绑定，上面都会有详细的教程。

注册完成后，会得到三个和App相关的参数：ACCESS ID，ACCESS KEY，SECRET KEY。

客户端需要调用接口来注册程序的ACCESSID和ACESSKEY
		
	- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    	[IFOEMUtils setXinGeAppId:123456788];	//access id
    	[IFOEMUtils setXinGeAppKey:@"ISHGJ5A7342D"];//accesskey
   		//do somethigs
    	return YES;
	}
如果是OEM集成，客户端做这些就可以了。如果是一般集成，在AppDelegate中还需要做如下注册信鸽的设置：

	- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken { 
    	NSString * deviceTokenStr = [XGPush registerDevice:deviceToken];
    	[XGPush registerDevice:deviceToken];
    	[IFIntegrationUtils setDeviceToken:deviceTokenStr];//必须，在程序里记录设备。
	}
	- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings
	{
    	[application registerForRemoteNotifications];
	}
	- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo{
    	// 处理推送消息
	}

服务器端也需要借助信鸽推送插件来做相应的设置，设置好scretKey和accessId。

完成这些后，定时任务发送的推送即可被集成App收到。

**10.	如何获取报表在服务器端配置的封面图？**

在通过IFIntegrationUtils loadReportTree方法获取到IFEntryNode数组后，对每一个entryNode，使用

	[IFIntegrationUtils readEntryImage:entryNode.entryId coverId:entryNode.coverId sucess:^(UIImage *image) {
            //image就是服务器端配置的缩略图，这个方法是做过缓存处理的，不用担心每次都会向服务器发请求。
   	}];	
   
**11.	如何展示非全屏的报表**
说明：目前不支持填报报表的非全屏展现，只支持单页分页/表单的展现

	IFEntryView *entryView = [[IFEntryView alloc] initWithPath:@"app/DetailedDrillA-phone.cpt" serverUrl:@"http://www.finereporthelp.com:8889/app/ReportServer" viewType:IFEntryViewTypePage parameters:nil];
    [entryView setFrame:CGRectMake(0, 64, 800, 600)];
    entryView.entryViewDelegate = self;
    [self.view addSubview:entryView];
    [entryView doLoad];	//加载报表

使用报表视图的对象，需要实现IFEntryViewDelegate中的方法，让报表正常展示

-(void)pushHyperLink:(UIViewController *)viewController withAnimate:(BOOL)animate {

//处理报表View超级链接产生的视图控制器。

}
	