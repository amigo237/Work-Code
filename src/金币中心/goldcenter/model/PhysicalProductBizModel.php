<?php

class PhysicalProductBizModel extends GoldCenterReleaseModel{

	protected $pk = 'bizid';

	public function getPageList($page_num=1, $page_size=10){
		$data = array();
		$data_total = $this->count();
		$page_total = ceil($data_total / $page_size);
		if($page_num>0 && $page_num<=$page_total){
			$prev = $page_num - 1;
			$next = $page_num + 1;
			$data = $this->order('status,create_time DESC')->limit(($page_num-1)*$page_size, $page_size)->select();
		}
		$next = $next>$page_total ? 0 : $next;
		return array('data' => $data, 'page' => array('data_total' => $data_total,'total' => $page_total, 'cur' => $page_num, 'prev' => $prev,'next' => $next));
	}
	
	protected function _after_find(&$resultSet,$options){
		if($resultSet && isset($resultSet['userinfo'])){
			$resultSet['userinfo2'] = json_decode(urldecode($resultSet['userinfo']),true);
		}
	}

	protected function _after_select(&$resultSet, $options){
		$tempResult = array();
		foreach($resultSet as $row){
			$row['picture'] = $row['productid'];
			if(is_numeric($row['create_time'])){
				$row['create_time'] = date('Y-m-d H:i:s', intval($row['create_time']));
			}
			$tempResult[] = $row;
		}
		$resultSet = $tempResult;
	}

}
