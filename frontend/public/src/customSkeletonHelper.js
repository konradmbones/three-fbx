import * as THREE from 'three';

const _vector = /*@__PURE__*/ new THREE.Vector3();
const _boneMatrix = /*@__PURE__*/ new THREE.Matrix4();
const _matrixWorldInv = /*@__PURE__*/ new THREE.Matrix4();

export class SkeletonHelper2 extends THREE.SkeletonHelper{
    constructor(object){
        super(object);
    }

    updateMatrixWorld( force ) {

		const bones = this.bones;

		const geometry = this.geometry;
		const position = geometry.getAttribute( 'position' );

		_matrixWorldInv.copy( this.root.matrixWorld ).invert();

		for ( let i = 0, j = 0; i < bones.length; i ++ ) {

			const bone = bones[ i ];
			if ( bone.parent && bone.parent.isBone ) {

				_boneMatrix.multiplyMatrices( _matrixWorldInv, bone.matrixWorld );
				_vector.setFromMatrixPosition( _boneMatrix );
				position.setXYZ( j, _vector.x, _vector.y, _vector.z );

                if ( bone.parent.name === "root"){
                    position.setXYZ( j + 1, 1, 1, 1 );
                }     else{
                    _boneMatrix.multiplyMatrices( _matrixWorldInv, bone.parent.matrixWorld );
                    _vector.setFromMatrixPosition( _boneMatrix );
                    position.setXYZ( j + 1, _vector.x, _vector.y, _vector.z );
                }           
                


				j += 2;

			}

		}

		geometry.getAttribute( 'position' ).needsUpdate = true;

		super.updateMatrixWorld( force );

	}
}