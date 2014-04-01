<?php

class TaskBaseInfoModel extends GoldCenterModel{

	protected $pk = 'seqid';

	public function getPageGameList($page_num=1, $page_size=8){
		$data = array();
		$data_total = $this->count();
		$page_total = ceil($data_total / $page_size);
		if($page_num>0 && $page_num<=$page_total){
			$prev = $page_num - 1;
			$next = $page_num + 1;
			$data = $this->order('tasktype DESC,seqid DESC')->limit(($page_num-1)*$page_size, $page_size)->select();
		}
		$next = $next>$page_total ? 0 : $next;
		return array('data' => $data, 'page' => array('data_total' => $data_total,'total' => $page_total, 'cur' => $page_num, 'prev' => $prev,'next' => $next));
	}

	protected function _after_find(&$result, $options){
		if(!empty($result) && isset($result['taskintro'])){
			$result['taskintro2'] = json_decode($result['taskintro'],true);
		}
	}

	public function dictMap(){
		$map = array();
		$tasks_info = $this->select();
		foreach($tasks_info as $value){
			$map[$value['seqid']] = array(
				'tasktype' => $value['tasktype']
			);
		}
		return $map;
	}

}
