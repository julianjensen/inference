/** ******************************************************************************************************************
 * @file Describe what scopes does.
 * @author Julian Jensen <jjdanois@gmail.com>
 * @since 1.0.0
 * @date 27-May-2018
 *********************************************************************************************************************/
"use strict";

export class ScopeManager
{
    init()
    {
        ScopeManager.global = ScopeManager.current = new Scope();
    }
}

export class Scope
{

}
