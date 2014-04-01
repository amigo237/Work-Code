<?php

class AllProductListModel extends GoldCenterReleaseModel{

	protected $pk = 'productid';

	public function updateData($data){
		if(empty($data)) return false;
		$keys = array(
			'productid' => 's',
			'cost' => 'i',
			'productname' => 's',
			'productinfo' => 's',
		);
		$sql = 'REPLACE INTO `all_product_list` ';
		$sql .= ' ('.preg_replace('/([^,]+)/i', '`\\1`', implode(',', array_keys($keys))).') VALUES ';
		$sql_values = array();
		foreach($data as $row){
			$values = array();
			$productinfo = array();
			if(isset($row['title'])){
				$productinfo['title'] = $row['title'];
			}
			if(isset($row['category'])){
				$productinfo['category'] = $row['category'];
			}
			if(isset($row['cover'])){
				$productinfo['cover'] = $row['cover'];
			}
			foreach($keys as $k => $t){
				if($t=='s'){
					if($k == 'productinfo'){
						$values[] = "'".urlencode(json_encode($productinfo))."'";
					}else if($k == 'productname'){
						$values[] = "'".$row['title']."'";
					}else{
						$values[] = "'".$row[$k]."'";
					}
				}else{
					$values[] = $row[$k];
				}
			}
			$sql_values[] = '('.implode(',', $values).')';
			if(count($sql_values) == 1000){
				$this->execute($sql.implode(',', $sql_values));
				$sql_values = array();
				$num = 0;
			}
		}
		if(!empty($sql_values)){
			$this->execute($sql.implode(',', $sql_values));
		}
		return true;
	}

}
