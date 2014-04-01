<?php

import('goldcenter.model.GoldCenterModel');
import('goldcenter.model.ProductBaseInfoModel');
import('goldcenter.model.ProductConfigDataModel');
import('goldcenter.model.RecommandProductDataModel');

class ProductController extends Controller{

	protected $is_admin;
	protected $executor;

	const IMG_DIR = 'goldcenter';

	protected function _initialize(){
		$login_info = unserialize(session_get(USER_STATE_FLAG));
		$this->executor = $login_info;
		$this->is_admin = $login_info['is_admin'];
	}

	public function actionIndex($page_num=1){
		$title = array(
			'_id_' => 'productid',
			'productid' => array('name'=>'ID', 'width'=>'15%'),
			'productname' => array('name'=>'名称', 'width'=>'20%'),
			'cover' => array('name'=>'图片', 'width'=>'25%', 'type'=>'img', 'baseurl'=>UPLOAD_URL),
			'daytotal' => array('name'=>'每日发放量', 'width'=>'10%'),
			'cost' => array('name'=>'金币', 'width'=>'5%'),
			'status' => array('name'=>'状态', 'width'=>'5%', 'trans'=>array('1'=>'上线中','0'=>'已下线')),
			'_action_' => array(
				'name' => '操作',
				'width'=>'20%',
				'menu' => array(
					array('name'=>'置顶', 'click'=>'xbox_take_priority', 'args'=>'productid'),
					array('name'=>array('flag'=>'status', 'title'=>array('1'=>'下线','0'=>'上线')), 'click'=>'xbox_disable_product', 'args'=>array('productid','status')),
					array('name'=>'修改', 'click'=>'xbox_edit_product_data', 'args'=>'productid'),
				)
			)
		);

		if($this->is_admin){
			$title['_action_']['menu'][] = array('name'=>'删除', 'click'=>'xbox_delete_product_data', 'args'=>'productid');
		}

		$model = new ProductConfigDataModel;
		$page_size = 10;
		$data = $model->getPageList($page_num, $page_size);
		$datagrid = DataGrid::display(array('title' => $title, 'data' => $data['data']));
		$this->assign('pagebar', $data['page']);
		$this->assign('datagrid', $datagrid);
		$this->display();
	}

	public function actionIndex2($page_num=1){
		$title = array(
			'_id_' => 'seqid',
			//'productid' => array('name'=>'ID', 'width'=>'15%'),
			'title' => array('name'=>'名称', 'width'=>'30%'),
			'category' => array('name'=>'分类', 'width'=>'10%', 'trans'=>array('1'=>'会员代金券','2'=>'会员卡','3'=>'牛X积分','4'=>'实物','5'=>'高速通道','6'=>'电影院')),
			'cover' => array('name'=>'图片', 'width'=>'30%', 'type'=>'img', 'baseurl'=>UPLOAD_URL),
			'_action_' => array(
				'name' => '操作',
				'width'=>'15%',
				'menu' => array(
					array('name'=>'修改', 'click'=>'xbox_edit_product_info', 'args'=>'seqid'),
					array('name'=>'删除', 'click'=>'xbox_delete_product_info', 'args'=>'seqid'),
				)
			)
		);
		$model = new ProductBaseInfoModel;
		$page_size = 10;
		$data = $model->getPageList($page_num, $page_size);
		$datagrid = DataGrid::display(array('title' => $title, 'data' => $data['data']));
		$this->assign('pagebar', $data['page']);
		$this->assign('datagrid', $datagrid);
		$this->display();
	}

	public function actionRecommand(){
		$title = array(
			'_id_' => 'productid',
			'productid' => array('name'=>'ID', 'width'=>'15%'),
			'title2' => array('name'=>'名称', 'width'=>'30%'),
			'tag' => array('name'=>'标签', 'width'=>'10%', 'trans'=>array('1'=>'新','2'=>'热')),
			'cover2' => array('name'=>'图片', 'width'=>'30%', 'type'=>'img', 'baseurl'=>UPLOAD_URL),
			'_action_' => array(
				'name' => '操作',
				'width'=>'15%',
				'menu' => array(
					array('name'=>'置顶', 'click'=>'xbox_take_priority', 'args'=>'productid'),
					array('name'=>'修改', 'click'=>'xbox_edit_product', 'args'=>'productid'),
					array('name'=>'删除', 'click'=>'xbox_delete_product', 'args'=>'productid'),
				),
			),
		);
		$model = new RecommandProductDataModel;
		$data = $model->select();
		$datagrid = DataGrid::display(array('title' => $title, 'data' => $data));
		$this->assign('datagrid', $datagrid);
		$this->display();
	}

	public function actionRecommandForm($productid=''){
		$model = new ProductBaseInfoModel;
		$product_list = $model->getTransData();
		if(!empty($productid)){
			$model = new RecommandProductDataModel;
			$product_info = $model->where(array('productid'=>$productid))->find();
			$fields = array(
				array('name' => 'productid', 'label' => '奖品', 'type' => 'select', 'default' => $productid, 'options' => $product_list, 'disabled'=>'disabled'),
				array('name' => 'title2', 'label' => '推荐名称', 'type' => 'text', 'default' => $product_info['title2'], 'maxlength' => 100),
				array('name' => 'cover2', 'label' => '推荐图片', 'type' => 'image2', 'default' => $product_info['cover2'], 'url' => '/index.php?r=goldcenter/product/uploadImage'),
				array('name' => 'tag', 'label' => '标签', 'type' => 'radio', 'default' => $product_info['tag'], 'options' => array('1'=>'新', '2'=>'热')),
			);
		}else{
			$fields = array(
				array('name' => 'productid', 'label' => '奖品', 'type' => 'select', 'options' => $product_list),
				array('name' => 'title2', 'label' => '推荐名称', 'type' => 'text', 'maxlength' => 100),
				array('name' => 'cover2', 'label' => '推荐图片', 'type' => 'image2', 'url' => '/index.php?r=goldcenter/product/uploadImage'),
				array('name' => 'tag', 'label' => '标签', 'type' => 'radio', 'default'=>'1', 'options'=>array('1'=>'新', '2'=>'热')),
			);
		}
		$config = array(
			'prefix' => 'product_recommand_',
			'form' => array('id' => 'form', 'action' => '/index.php?r=goldcenter/product/saveRecommand'),
			'fields' => $fields,
		);
		$this->assign('formbox', Form::render($config));
		$this->display();
	}

	public function actionSaveRecommand($productid, $title2='', $cover2='', $tag=0){
		if(!isset($_POST['productid'])){
			ajax_return(0, '未选择奖品！');
		}
		$productid = $_POST['productid'];
		$model1 = new ProductBaseInfoModel;
		$baseinfo = $model1->where(array('productid'=>$productid))->find();
		$model2 = new RecommandProductDataModel;
		$model2->productid = $productid;
		if(empty($title2)){
			$title2 = $baseinfo['title'];
		}
		if(!empty($cover2)){
			$savefile = RES_PATH.$cover2;
			if(!is_file($savefile)){
				$tempfile = UPLOAD_PATH.$cover2;
				if(!(is_file($tempfile) && copy($tempfile, $savefile))){
					ajax_return(0, '图片保存失败！');
				}
			}
		}else{
			$cover2 = $baseinfo['cover'];
		}
		$model2->title2 = $title2;
		$model2->cover2 = $cover2;
		$model2->tag = $tag;
		if($model2->add()){
			ajax_return(1, '奖品新增成功！');
		}
		ajax_return(0, '奖品新增失败！');
	}

	public function actionUpdateRecommandData($productid){
		$retdata = array();
		$model = new RecommandProductDataModel;
		$model->productid = $productid;
		$model->create_user = '['.$this->executor['uid'].']'.$this->executor['name'];
		$model->create_time = date('Y-m-d H:i:s');
		if(isset($_POST['title2'])){
			$model->title2 = $_POST['title2'];
			$retdata['name'] = 'title2';
			$retdata['value'] = $_POST['title2'];
		}else if(isset($_POST['cover2'])){
			$model->cover2 = $_POST['cover2'];
			$retdata['name'] = 'cover2';
			$retdata['value'] = $_POST['cover2'];
		}
		if($model->save()){
			ajax_return(1, '修改成功！', $retdata);
		}
		ajax_return(0, '修改失败！');
	}

	public function actionDeleteRecommandData($productid){
		$model = new RecommandProductDataModel;
		if($model->delete($productid)){
			ajax_return(1, '删除成功');
		}
		ajax_return(0, '删除失败');
	}

	public function actionTakeRecommandPriority($productid){
		$model = new RecommandProductDataModel;
		$model->productid = $productid;
		$model->orderno = time();
		if($model->save()){
			ajax_return(1, "置顶成功！");
		}
		ajax_return(0, "置顶失败！");
	}

	public function actionDisable($productid, $status){
		$status = intval($status)== 0 ? 1 : 0;
		$status_info = array(0=>'下线', 1=>'上线');
		$model = new ProductConfigDataModel;
		$model->productid = $productid;
		$model->status = $status;
		if($model->save()){
			ajax_return(1, $status_info[$status]."成功！");
		}
		ajax_return(0, $status_info[$status]."失败！");
	}

	public function actionEditinfo($seqid){
		$model = new ProductBaseInfoModel;
		$product_info = $model->find($seqid);
		$this->assign('product_info', $product_info);
		$this->display();
	}

	public function actionSaveInfo($seqid){
		$retdata = array();
		$model = new ProductBaseInfoModel;
		if(isset($_POST['description'])){
			$model->description = $_POST['description'];
			$retdata['name'] = 'description';
			$retdata['value'] = $_POST['description'];
		}else if(isset($_POST['extra_fields'])){
			$model->extra_fields = $_POST['extra_fields'];
			$retdata['name'] = 'extra_fields';
			$retdata['value'] = $_POST['extra_fields'];
		}else if(isset($_POST['external_url'])){
			$model->external_url = $_POST['external_url'];
			$retdata['name'] = 'external_url';
			$retdata['value'] = $_POST['external_url'];
		}else if(isset($_POST['require_params'])){
			$model->require_params = $_POST['require_params'];
			$retdata['name'] = 'require_params';
			$retdata['value'] = $_POST['require_params'];
		}else if(isset($_POST['cover'])){
			$retdata['name'] = 'cover';
			$retdata['value'] = $imgurl;
			$imgurl = $_POST['cover'];
			$savefile = RES_PATH.$imgurl;
			if(!is_file($savefile)){
				$tempfile = UPLOAD_PATH.$imgurl;
				if(is_file($tempfile) && copy($tempfile, $savefile)){
					$model->cover = $imgurl;
				}else{
					ajax_return(0, '图片修改失败！');
				}
			}else{
				ajax_return(1, '图片修改成功！', $retdata);
			}
		}
		$model->seqid = $seqid;
		if($model->save()){
			ajax_return(1, '修改成功！', $retdata);
		}
		ajax_return(0, '修改失败！');
	}

	public function actionEditdata($productid){
		$model1 = new ProductConfigDataModel;
		$model2 = new ProductBaseInfoModel;
		$product_config_data = $model1->where(array('productid'=>$productid))->find();
		$product_info = $model2->where(array('seqid'=>$product_config_data['baseid']))->find();
		$product_config_data['category'] = $product_info['category'];
		$product_config_data['title'] = $product_info['title'];
		$this->assign('product_config_data', $product_config_data);
		$this->display();
	}

	public function actionUpdateData($productid){
		$retdata = array();
		$model = new ProductConfigDataModel;
		$model->productid = $productid;
		$model->create_user = '['.$this->executor['uid'].']'.$this->executor['name'];
		$model->create_time = date('Y-m-d H:i:s');
		if(isset($_POST['daytotal'])){
			$model->daytotal = $_POST['daytotal'];
			$retdata['name'] = 'daytotal';
			$retdata['value'] = $_POST['daytotal'];
		}
		/*
		else if(isset($_POST['cost'])){
			$model->cost = $_POST['cost'];
			$retdata['name'] = 'cost';
			$retdata['value'] = $_POST['cost'];
		}
		*/
		if($model->save()){
			ajax_return(1, '修改成功！', $retdata);
		}
		ajax_return(0, '修改失败！');
	}

	public function actionDelete($seqid){
		$model = new ProductBaseInfoModel;
		$product = $model->where(array('seqid'=>$seqid))->find();
		if($product){
			if($model->delete($seqid)){
				$model = new ProductConfigDataModel;
				$model->delete($product['productid']);
				ajax_return(1, '删除成功');
			}
		}
		ajax_return(0, '删除失败');
	}

	public function actionDeleteData($productid){
		$model = new ProductConfigDataModel;
		if($model->delete($productid)){
			ajax_return(1, '删除成功');
		}
		ajax_return(0, '删除失败');
	}

	public function actionForm(){
		$result_code = 0;
		if(cookie_isset('result_code')){
			$result_code = cookie_get('result_code');
			cookie_del('result_code');
		}
		$this->assign('result_code', $result_code);
		$this->display();
	}

	public function actionForm2(){
		$model = new ProductBaseInfoModel;
		$sql = "SELECT `category`, `seqid` AS baseid, `title` FROM `product_base_info` ";
		//$sql .= " WHERE `productid` NOT IN (SELECT `productid` FROM `product_config_data`)";
		$products = $model->query($sql);
		$category_products = array();
		foreach($products as $row){
			$category_products[$row['category']][] = $row;
		}
		$result_code = 0;
		if(cookie_isset('result_code')){
			$result_code = cookie_get('result_code');
			cookie_del('result_code');
		}
		$this->assign('result_code', $result_code);
		$this->assign('category_products', json_encode($category_products));
		$this->display();
	}

	public function actionSaveExtraData($productid){
		$tmpdata = $_POST;
		$model = new ProductBaseInfoModel;
		$product_info = $model->where(array('productid' => $productid))->find();
		if($product_info && isset($product_info['extra_fields2'])){
			$config_info = $product_info['extra_fields2'];
			$extra_data = array();
			foreach($config_info as $key => $config){
				if(isset($tmpdata[$key])){
					$extra_data[$key] = trim($tmpdata[$key]);
				}else{
					if(isset($config['check'])){
						if($config['check']=="empty"){
							ajax_return(0, "扩展信息保存失败：【".$config['label']."】必填！");
						}
					}else{
						$extra_data[$key] = '';
					}
				}
			}
			$model = new ProductConfigDataModel;
			$model->productid = $productid;
			$model->extra_info = json_encode($extra_data);
			$model->create_user = '['.$this->executor['uid'].']'.$this->executor['name'];
			$model->create_time = date('Y-m-d H:i:s');
			if($model->save()){
				ajax_return(1, '扩展信息保存成功');
			}
		}
		ajax_return(0, '扩展信息保存失败');
	}

	public function actionSaveTmpExtraData($baseid){
		$tmpdata = $_POST;
		$model = new ProductBaseInfoModel;
		$product_info = $model->where(array('seqid' => $baseid))->find();
		if($product_info && isset($product_info['extra_fields2'])){
			$config_info = $product_info['extra_fields2'];
			$extra_data = array();
			foreach($config_info as $key => $config){
				if(isset($tmpdata[$key])){
					$extra_data[$key] = trim($tmpdata[$key]);
				}else{
					if(isset($config['check'])){
						if($config['check']=="empty"){
							ajax_return(0, "扩展信息保存失败：【".$config['label']."】必填！");
						}
					}else{
						$extra_data[$key] = '';
					}
				}
			}
			import('goldcenter.model.ProductTmpExtraDataModel');
			$model = new ProductTmpExtraDataModel;
			$model->baseid = $baseid;
			$model->extra_data = json_encode($extra_data);
			$seqid = $model->add();
			if($seqid){
				ajax_return(1, '扩展信息保存成功', array('extra_data_id' => $seqid));
			}
		}
		ajax_return(0, '扩展信息保存失败');
	}

	public function actionExtraInfoForm($baseid){
		$model = new ProductBaseInfoModel;
		$product_info = $model->where(array('seqid' => $baseid))->find();
		if($product_info && isset($product_info['extra_fields2'])){
			$config_info = $product_info['extra_fields2'];
			$check_script = array();
			foreach($config_info as $key => $row){
				if(isset($row['type']) && $row['type'] == "image2"){
					$row['url'] = '/index.php?r=goldcenter/product/uploadImage';
				}
				$row['name'] = $key;
				$config['fields'][] = $row;
			}
			ajax_return(1, '', array('baseid' => $baseid, 'extra_form'=>Form::render($config)));
		}else{
			ajax_return(0, '');
		}
	}

	public function actionEditExtraInfoForm($productid){
		$model = new ProductBaseInfoModel;
		$product_info = $model->where(array('productid' => $productid))->find();
		$model = new ProductConfigDataModel;
		$product_config_info = $model->where(array('productid' => $productid))->find();
		if($product_info && isset($product_info['extra_fields2'])){
			$product_data = $product_config_info['extra_info2'];
			$config_info = $product_info['extra_fields2'];
			$check_script = array();
			foreach($config_info as $key => $row){
				if(isset($row['type']) && $row['type'] == "image2"){
					$row['url'] = '/index.php?r=goldcenter/product/uploadImage';
				}
				if(isset($product_data[$key])){
					$row['default'] = $product_data[$key];
				}
				$row['name'] = $key;
				$config['fields'][] = $row;
			}
			ajax_return(1, '', array('productid' => $productid, 'extra_form'=>Form::render($config)));
		}else{
			ajax_return(0, '');
		}
	}

	public function actionTakePriority($productid){
		$model = new ProductConfigDataModel;
		$model->productid = $productid;
		$model->orderno = time();
		if($model->save()){
			ajax_return(1, "置顶成功！");
		}
		ajax_return(0, "置顶失败！");
	}

	public function actionSaveData($category, $baseid, $productname, $daytotal, $cost, $extra_info=''){
		$result_code = 2;
		$model = new ProductConfigDataModel;
		$model->baseid = $baseid;
		$model->productname = $productname;
		$model->productid = 'GOLD'.str_pad($category, 4, "0", STR_PAD_LEFT).date('ymdHis');
		$model->daytotal = $daytotal;
		$model->cost = $cost;
		$model->status = 0;
		$model->create_user = '['.$this->executor['uid'].']'.$this->executor['name'];
		$model->create_time = date('Y-m-d H:i:s');
		$model->publish_user = '';
		$model->publish_time = '';
		if(!empty($extra_info)){
			if(is_numeric($extra_info)){
				import('goldcenter.model.ProductTmpExtraDataModel');
				$extra_model = new ProductTmpExtraDataModel;
				$tmp_extra_data = $extra_model->find(intval($extra_info));
				if($tmp_extra_data && $tmp_extra_data['baseid'] == $baseid){
					$extra_info = $tmp_extra_data['extra_data'];
				}
			}
		}
		$model->extra_info = $extra_info;
		if($model->add()){
			$result_code = 1;
		}
		cookie_set('result_code', $result_code);
		$this->redirect('/index.php?r=goldcenter/product/form2');
	}

	public function actionCreate($title, $category, $imgurl, $description='', $extra_fields='', $external_url='', $require_params=''){
		$result_code = 2;
		$tempfile = UPLOAD_PATH.$imgurl;
		if(is_file($tempfile) && copy($tempfile, RES_PATH.$imgurl)){
			$model = new ProductBaseInfoModel;
			$model->productid = 'TMP'.time();
			$model->title = $title;
			$model->category = $category;
			$model->description = $description;
			$model->extra_fields = $extra_fields;
			$model->external_url = $external_url;
			$model->require_params = $require_params;
			$model->cover = $imgurl;
			$seqid = $model->add();
			if($seqid){
				//$model2 = new ProductBaseInfoModel;
				//$model2->seqid = $seqid;
				//$model2->productid = 'GOLD'.str_pad($category, 4, "0", STR_PAD_LEFT).str_pad($seqid, 12, "0", STR_PAD_LEFT);
				//if($model2->save()){
					$result_code = 1;
				//}
			}
		}
		cookie_set('result_code', $result_code);
		$this->redirect('/index.php?r=goldcenter/product/form');
	}

	public function actionGenerate(){
		$model = new ProductBaseInfoModel;
		$base_data = $model->select2();
		$model = new ProductConfigDataModel;
		$data = $model->where(array('status'=>1))->order('orderno DESC')->select();
		if($data){
			$page_data = array();
			$config_data = array();
			$num = 1;
			foreach($data as $row){
				$n = $num%4;
				$style = $n<4 ? 'bor'.$n : '';
				$row['style'] = $style;
				$extra_info = '';
				if(!empty($row['extra_info'])){
					$extra_info = urlencode(format_url_params(json_decode($row['extra_info'], true)));
				}
				$base_row = $base_data[$row['baseid']];
				//$title = $base_row['title'];
				$title = $row['productname'];
				$row['title'] = $title;
				$cover = get_cdn_imgurl($base_row['cover']);
				$row['cover'] = $cover;
				$config_data[$row['productid']] = array(
					'title' => $title,
					'category' => $base_row['category'],
					'cost' => $row['cost'],
					'cover' => $cover,
					'params' => $extra_info,
				);
				$pn = ceil($num / 4);
				$page_data[$pn-1][] = $row;
				$num ++;
			}
			$generate_path = DATA_PATH.'goldcenter/html/';
			if(!is_dir($generate_path)){
				mkdir($generate_path, 0755, true);
			}
			$this->assign('product_page_data', $page_data);
			$this->assign('product_config_data', json_encode($config_data));
			$content = $this->fetch(TPL_PATH.'goldcenter_mall.htm');
			if(file_put_contents($generate_path.'mall.html', $content)>0){
				ajax_return(1, '生成配置成功！');
			}
		}
		ajax_return(0, '生成配置失败！');
	}

	private function prepareData(){
		$product_data = array();
		$product_exchange = array();
		$model = new ProductConfigDataModel;
		$data = $model->getBizData();
		foreach($data as $row){
			$product_data[] = array(
				'productid' => $row['productid'],
				'title' => $row['productname'],
				'category' => $row['category'],
				'cover' => $row['cover'],
				'daytotal' => $row['daytotal'],
				'cost' => $row['cost'],
				'exchanged' => 0,
			);
			$product_exchange[] = array(
				'productid' => $row['productid'],
				'category' => $row['category'],
				'external_url' => $row['external_url'],
				'require_params' => $row['require_params'],
				'remark' => '',
			);
		}
		return array('product_data' => $product_data, 'product_exchange' => $product_exchange);
	}

	public function actionPublish(){
		$error_info = '发布失败：';
		@exec(PUBLISH_GOLDCENTER_SH.' product', $output,$ret);
		if($ret == 0){
			import('goldcenter.model.GoldCenterReleaseModel');
			import('goldcenter.model.ProductDataModel');
			import('goldcenter.model.ProductExchangeModel');
			import('goldcenter.model.AllProductListModel');
			$data = $this->prepareData();
			$model1 = new AllProductListModel;
			if(!$model1->updateData($data['product_data'])){
				ajax_return(0, $error_info."同步数据失败1");
			}
			$model = new ProductDataModel;
			if(!$model->updateData($data['product_data'])){
				ajax_return(0, $error_info."同步数据失败2");
			}
			$model = new ProductExchangeModel;
			if(!$model->updateData($data['product_exchange'])){
				ajax_return(0, $error_info."同步数据失败3");
			}
			$result_info1 = HttpHelper::notify(GOLDCENTER_PRODUCTDATA_URL1);
			$result_info2 = HttpHelper::notify(GOLDCENTER_PRODUCTDATA_URL2);
			$result_info3 = HttpHelper::notify(GOLDCENTER_PRODUCTEXCHANGE_URL1);
			$result_info4 = HttpHelper::notify(GOLDCENTER_PRODUCTEXCHANGE_URL2);
			$result_info5 = HttpHelper::notify2(GOLDCENTER_UPDATE_REDIS_URL, array('apiname'=>'redis_update'));
			$error_info = $error_info.$result_info1['info']." , ".$result_info2['info']." , ".$result_info3['info']." , ".$result_info4['info']." , ".$result_info5['info'];
			if($result_info1['result'] == 1 && $result_info2['result'] == 1 && $result_info3['result'] == 1 && $result_info4['result'] == 1 && $result_info5['result']==1){
				ajax_return(1,'配置发布成功');
			}

		}
		ajax_return(0, $error_info);
	}

	public function actionUploadImage(){
		$savepath = UPLOAD_PATH.self::IMG_DIR.'/';
		$upload = new UploadFile();
		$upload->maxSize = 3292200;
		$upload->allowExts = array("jpg","png");
		$upload->savePath = $savepath;
		$upload->uploadReplace = true;
		$upload->saveRule = get_image_basename();
		$upload->thumb = false;
		if(!$upload->upload()){
			ajax_return(0, "图片上传失败:".$upload->getErrorMsg());
		}
		$upload_info = $upload->getUploadFileInfo();
		$imgurl = self::IMG_DIR.'/'.$upload_info[0]['savename'];
		ajax_return(1, '图片上传成功！', array('imgurl' => $imgurl));
	}

}
