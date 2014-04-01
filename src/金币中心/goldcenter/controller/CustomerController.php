<?php

import('goldcenter.model.GoldCenterReleaseModel');
import('goldcenter.model.PhysicalProductBizModel');

class CustomerController extends Controller{

	protected $executor;

	protected function _initialize(){
		$login_info = unserialize(session_get(USER_STATE_FLAG));
		$this->executor = $login_info;
	}

	public function actionIndex($page_num=1){
		import('goldcenter.model.GoldCenterModel');
		import('goldcenter.model.ProductBaseInfoModel');
		$model = new ProductBaseInfoModel;
		$trans_data = $model->getTransData();
		$title = array(
			'_id_' => 'bizid',
			'productid' => array('name'=>'奖品', 'width'=>'20%', 'trans'=>$trans_data['name']),
			'picture' =>array('name'=>'奖品图片', 'width'=>'15%','trans'=>$trans_data['picture']),
			'userid' => array('name'=>'用户ID', 'width'=>'10%'),
			'create_time' => array('name'=>'兑奖时间', 'width'=>'10%'),
			'send_time' => array('name'=>'发放时间', 'width'=>'10%'),
			'send_user' => array('name'=>'发放人员', 'width'=>'10%'),
			'status' => array('name'=>'奖品状态', 'width'=>'10%', 'trans'=>array('1'=>'待确认', '2'=>'已送出', '3'=>'已送达')),
			'_action_' => array(
				'name' => '操作',
				'width'=>'15%',
				'menu' => array(
					array('name'=>'用户信息', 'click'=>'xbox_show_userinfo_panel', 'args'=>'bizid'),
					array('name'=>array('flag'=>'status', 'title'=>array('1'=>'送出','2'=>'送达')), 'click'=>'xbox_change_status', 'args'=>'bizid'),
				)
			)
		);
		$model = new PhysicalProductBizModel;
		$page_size = 10;
		$data = $model->getPageList($page_num, $page_size);
		$datagrid = DataGrid::display(array('title' => $title, 'data' => $data['data']));
		$this->assign('pagebar', $data['page']);
		$this->assign('datagrid', $datagrid);
		$this->display();
	}

	public function actionChangeStatus($bizid){
		$model = new PhysicalProductBizModel;
		$bizdata = $model->find($bizid);
		if(!empty($bizdata)){
			$status = 9;
			if($bizdata['status'] == 1){
				$model->status = 2;
				$status = 2;
				$model->check_user = $this->executor['name'];
				$model->check_time = date('Y-m-d H:i:s');
			}else if($bizdata['status'] == 2){
				$model->status = 3;
				$status = 3;
				$model->send_user = $this->executor['name'];
				$model->send_time = date('Y-m-d H:i:s');
			}else if($bizdata['status'] == 3){
				$status = 4;
			}
			$status_info = array(
				2 => '奖品送出成功！',
				3 => '奖品送达成功！',
				4 => '已完成奖品赠送！',
			);
			if($status == 2 || $status == 3){
				$result_info1 = HttpHelper::notify(GOLDCENTER_PRODUCT_NOTICE_URL1);
				$result_info2 = HttpHelper::notify(GOLDCENTER_PRODUCT_NOTICE_URL2);
				if($result_info1['result'] == 1 && $result_info2['result'] == 1){
					if($model->save()){
						ajax_return(1, $status_info[$status]);
					}
				}else{
					ajax_return(0,'消息发送失败');
				}
			}else if($status == 4){
				ajax_return(1, $status_info[$status]);
			}
		}
		ajax_return(0, "修改状态失败！");
	}

	public function actionFindUserinfo($bizid){
		$model = new PhysicalProductBizModel;
		$user_info = array(
			'address' => '',
			'postcode' => '',
			'realname' => '',
			'telephone' => '',
		);
		$data = $model->where(array('bizid'=>$bizid))->find();
		if(!empty($data['userinfo2'])){
			$user_info = $data['userinfo2'];
			ajax_return(1, "", $user_info);
		}
		ajax_return(0, "", $user_info);
	}
}
