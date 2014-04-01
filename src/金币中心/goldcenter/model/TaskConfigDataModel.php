<?php

class TaskConfigDataModel extends GoldCenterModel{

	protected $pk = 'dayno';

	protected function _after_select(&$resultSet,$options){
		$tempResult = array();
		foreach($resultSet as $row){
			if(!empty($row) && isset($row['tasklist'])){
				$row['tasklist2'] = json_decode($row['tasklist'],true);
				$row['dayno2'] = date('Y-m-d',strtotime($row['dayno']));
			}
			$tempResult[] = $row;
		}
		$resultSet = $tempResult;
	}
	protected function _after_find(&$resultSet,$options){
		if($resultSet && isset($resultSet['tasklist'])){
			$resultSet['tasklist2'] = json_decode($resultSet['tasklist'],true);
		}
	}

}
