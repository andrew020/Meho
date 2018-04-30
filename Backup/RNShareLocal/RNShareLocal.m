//
//  RNShare.m
//  demos
//
//  Created by 杨斌 on 2017/5/17.
//  Copyright © 2017年 Facebook. All rights reserved.
//

#import "RNShareLocal.h"

@import UIKit;

@implementation RNShareLocal

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(message:(NSString *)title picUrl:(NSString *)picUrl excluded:(NSArray *)excluded callback:(RCTResponseSenderBlock)callback)
{
    //定义一个可变数组，最多不能超过2个值
    NSMutableArray * objectsToShare = [NSMutableArray arrayWithCapacity:2];
    if(picUrl){
        UIImage * imageToShare = [UIImage imageWithData:[NSData dataWithContentsOfURL:[NSURL URLWithString: picUrl]]];
        [objectsToShare addObject:imageToShare];
    }
    if(title){
        [objectsToShare addObject:title];
    }
    UIActivityViewController *activityVC = [[UIActivityViewController alloc] initWithActivityItems:objectsToShare applicationActivities:nil];
    activityVC.excludedActivityTypes = @[UIActivityTypeAirDrop];
    
    UIViewController *rootController = UIApplication.sharedApplication.delegate.window.rootViewController;
    
    [rootController presentViewController:activityVC animated:YES completion:nil];
    
    NSMutableArray *excludedArray = [NSMutableArray arrayWithCapacity:15];
    if ([excluded containsObject:@"UIActivityTypeMessage"]) {
        [excludedArray addObject:UIActivityTypeMessage];
    }
    if ([excluded containsObject:@"UIActivityTypePostToFacebook"]) {
        [excludedArray addObject:UIActivityTypePostToFacebook];
    }
    if ([excluded containsObject:@"UIActivityTypePostToTwitter"]) {
        [excludedArray addObject:UIActivityTypePostToTwitter];
    }
    if ([excluded containsObject:@"UIActivityTypePostToWeibo"]) {
        [excludedArray addObject:UIActivityTypePostToWeibo];
    }
    if ([excluded containsObject:@"UIActivityTypeMail"]) {
        [excludedArray addObject:UIActivityTypeMail];
    }
    if ([excluded containsObject:@"UIActivityTypePrint"]) {
        [excludedArray addObject:UIActivityTypePrint];
    }
    if ([excluded containsObject:@"UIActivityTypeCopyToPasteboard"]) {
        [excludedArray addObject:UIActivityTypeCopyToPasteboard];
    }
    if ([excluded containsObject:@"UIActivityTypeAssignToContact"]) {
        [excludedArray addObject:UIActivityTypeAssignToContact];
    }
    if ([excluded containsObject:@"UIActivityTypeSaveToCameraRoll"]) {
        [excludedArray addObject:UIActivityTypeSaveToCameraRoll];
    }
    if ([excluded containsObject:@"UIActivityTypeAddToReadingList"]) {
        [excludedArray addObject:UIActivityTypeAddToReadingList];
    }
    if ([excluded containsObject:@"UIActivityTypePostToFlickr"]) {
        [excludedArray addObject:UIActivityTypePostToFlickr];
    }
    if ([excluded containsObject:@"UIActivityTypePostToVimeo"]) {
        [excludedArray addObject:UIActivityTypePostToVimeo];
    }
    if ([excluded containsObject:@"UIActivityTypePostToTencentWeibo"]) {
        [excludedArray addObject:UIActivityTypePostToTencentWeibo];
    }
    if ([excluded containsObject:@"UIActivityTypeAirDrop"]) {
        [excludedArray addObject:UIActivityTypeAirDrop];
    }
    if ([excluded containsObject:@"UIActivityTypeOpenInIBooks"]) {
        [excludedArray addObject:UIActivityTypeOpenInIBooks];
    }
    
    
    //NSLog(@"%@", excludedArray);
    activityVC.excludedActivityTypes = excludedArray;
    
    activityVC.completionWithItemsHandler = ^(NSString *activityType, BOOL completed, NSArray *returnedItems, NSError *activityError) {
        if (completed){
            //NSLog(@"The Activity: %@ was completed", activityType);
            callback(@[activityType]);
        }else{
            //NSLog(@"The Activity: %@ was NOT completed", activityType);
            callback(@[@"fail"]);
        }
        
    };
}

//分享连接
RCT_EXPORT_METHOD(link:(NSString *)title url:(NSString *)url picUrl:(NSString *)picUrl excluded:(NSArray *)excluded callback:(RCTResponseSenderBlock)callback)
{
    
    //定义一个可变数组，最多不能超过2个值
    NSMutableArray * objectsToShare = [NSMutableArray arrayWithCapacity:2];
    if(picUrl){
        UIImage * imageToShare = [UIImage imageWithData:[NSData dataWithContentsOfURL:[NSURL URLWithString: picUrl]]];
        [objectsToShare addObject:imageToShare];
    }
    if(title){
        [objectsToShare addObject:title];
    }
    if(url){
        [objectsToShare addObject:[NSURL URLWithString:url]];
    }
    
    UIActivityViewController *activityVC = [[UIActivityViewController alloc] initWithActivityItems:objectsToShare applicationActivities:nil];
    
    UIViewController *rootController = UIApplication.sharedApplication.delegate.window.rootViewController;
    
    [rootController presentViewController:activityVC animated:YES completion:nil];
    
    NSMutableArray *excludedArray = [NSMutableArray arrayWithCapacity:15];
    if ([excluded containsObject:@"UIActivityTypeMessage"]) {
        [excludedArray addObject:UIActivityTypeMessage];
    }
    if ([excluded containsObject:@"UIActivityTypePostToFacebook"]) {
        [excludedArray addObject:UIActivityTypePostToFacebook];
    }
    if ([excluded containsObject:@"UIActivityTypePostToTwitter"]) {
        [excludedArray addObject:UIActivityTypePostToTwitter];
    }
    if ([excluded containsObject:@"UIActivityTypePostToWeibo"]) {
        [excludedArray addObject:UIActivityTypePostToWeibo];
    }
    if ([excluded containsObject:@"UIActivityTypeMail"]) {
        [excludedArray addObject:UIActivityTypeMail];
    }
    if ([excluded containsObject:@"UIActivityTypePrint"]) {
        [excludedArray addObject:UIActivityTypePrint];
    }
    if ([excluded containsObject:@"UIActivityTypeCopyToPasteboard"]) {
        [excludedArray addObject:UIActivityTypeCopyToPasteboard];
    }
    if ([excluded containsObject:@"UIActivityTypeAssignToContact"]) {
        [excludedArray addObject:UIActivityTypeAssignToContact];
    }
    if ([excluded containsObject:@"UIActivityTypeSaveToCameraRoll"]) {
        [excludedArray addObject:UIActivityTypeSaveToCameraRoll];
    }
    if ([excluded containsObject:@"UIActivityTypeAddToReadingList"]) {
        [excludedArray addObject:UIActivityTypeAddToReadingList];
    }
    if ([excluded containsObject:@"UIActivityTypePostToFlickr"]) {
        [excludedArray addObject:UIActivityTypePostToFlickr];
    }
    if ([excluded containsObject:@"UIActivityTypePostToVimeo"]) {
        [excludedArray addObject:UIActivityTypePostToVimeo];
    }
    if ([excluded containsObject:@"UIActivityTypePostToTencentWeibo"]) {
        [excludedArray addObject:UIActivityTypePostToTencentWeibo];
    }
    if ([excluded containsObject:@"UIActivityTypeAirDrop"]) {
        [excludedArray addObject:UIActivityTypeAirDrop];
    }
    if ([excluded containsObject:@"UIActivityTypeOpenInIBooks"]) {
        [excludedArray addObject:UIActivityTypeOpenInIBooks];
    }
    
    
    //NSLog(@"%@", excludedArray);
    activityVC.excludedActivityTypes = excludedArray;
    
    activityVC.completionWithItemsHandler = ^(NSString *activityType, BOOL completed, NSArray *returnedItems, NSError *activityError) {
        if (completed){
            //NSLog(@"The Activity: %@ was completed", activityType);
            callback(@[activityType]);
        }else{
            //NSLog(@"The Activity: %@ was NOT completed", activityType);
            callback(@[@"fail"]);
        }
        
    };
}

//分享多图，最多九张
RCT_EXPORT_METHOD(pictures:(NSArray *)ImagesUrl title:(NSString*)title excluded:(NSArray *)excluded callback:(RCTResponseSenderBlock)callback)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        UIViewController *rootController = UIApplication.sharedApplication.delegate.window.rootViewController;
        UIActivityIndicatorView *activity = [[UIActivityIndicatorView alloc] initWithActivityIndicatorStyle:UIActivityIndicatorViewStyleWhiteLarge];
        [activity startAnimating];
        
        UIView *view = [[UIView alloc] initWithFrame:CGRectMake(0, 0, 100, 100)];
        view.backgroundColor = [UIColor colorWithWhite:0 alpha:0.8];
        view.layer.masksToBounds = YES;
        view.layer.cornerRadius = 10;
        
        [view addSubview:activity];
        activity.center = view.center;
        [rootController.view addSubview:view];
        view.center = rootController.view.center;
        
        rootController.view.userInteractionEnabled = NO;
        
        dispatch_async(dispatch_get_global_queue(0, 0), ^{
            NSUInteger count = [ImagesUrl count];
            //定义一个可变数组来存放分享的图片，最多不能超过9个
            NSMutableArray * objectsToShare = [NSMutableArray arrayWithCapacity:9];
            NSString *dataPrefix = @"data:image/png;base64,";
            for (int i = 0; i < count; i++) {
                NSString * imageUrl = [ImagesUrl objectAtIndex: i];
                UIImage * imageToShare = nil;
                if ([imageUrl hasPrefix:dataPrefix]) {
                    imageUrl = [imageUrl stringByReplacingOccurrencesOfString:dataPrefix withString:@""];
                    NSData *imageData = [[NSData alloc] initWithBase64EncodedString:imageUrl options:NSDataBase64DecodingIgnoreUnknownCharacters];
                    if (imageData) {
                        imageToShare = [UIImage imageWithData:imageData];
                    }
                }
                else {
                    imageToShare = [UIImage imageWithData:[NSData dataWithContentsOfURL:[NSURL URLWithString: imageUrl]]];
                }
                if (!imageToShare) {
                    continue;
                }
                [objectsToShare addObject:imageToShare];
                if(i == 8)break;
            }
            
            NSMutableArray *excludedArray = [NSMutableArray arrayWithCapacity:15];
            if ([excluded containsObject:@"UIActivityTypeMessage"]) {
                [excludedArray addObject:UIActivityTypeMessage];
            }
            if ([excluded containsObject:@"UIActivityTypePostToFacebook"]) {
                [excludedArray addObject:UIActivityTypePostToFacebook];
            }
            if ([excluded containsObject:@"UIActivityTypePostToTwitter"]) {
                [excludedArray addObject:UIActivityTypePostToTwitter];
            }
            if ([excluded containsObject:@"UIActivityTypePostToWeibo"]) {
                [excludedArray addObject:UIActivityTypePostToWeibo];
            }
            if ([excluded containsObject:@"UIActivityTypeMail"]) {
                [excludedArray addObject:UIActivityTypeMail];
            }
            if ([excluded containsObject:@"UIActivityTypePrint"]) {
                [excludedArray addObject:UIActivityTypePrint];
            }
            if ([excluded containsObject:@"UIActivityTypeCopyToPasteboard"]) {
                [excludedArray addObject:UIActivityTypeCopyToPasteboard];
            }
            if ([excluded containsObject:@"UIActivityTypeAssignToContact"]) {
                [excludedArray addObject:UIActivityTypeAssignToContact];
            }
            if ([excluded containsObject:@"UIActivityTypeSaveToCameraRoll"]) {
                [excludedArray addObject:UIActivityTypeSaveToCameraRoll];
            }
            if ([excluded containsObject:@"UIActivityTypeAddToReadingList"]) {
                [excludedArray addObject:UIActivityTypeAddToReadingList];
            }
            if ([excluded containsObject:@"UIActivityTypePostToFlickr"]) {
                [excludedArray addObject:UIActivityTypePostToFlickr];
            }
            if ([excluded containsObject:@"UIActivityTypePostToVimeo"]) {
                [excludedArray addObject:UIActivityTypePostToVimeo];
            }
            if ([excluded containsObject:@"UIActivityTypePostToTencentWeibo"]) {
                [excludedArray addObject:UIActivityTypePostToTencentWeibo];
            }
            if ([excluded containsObject:@"UIActivityTypeAirDrop"]) {
                [excludedArray addObject:UIActivityTypeAirDrop];
            }
            if ([excluded containsObject:@"UIActivityTypeOpenInIBooks"]) {
                [excludedArray addObject:UIActivityTypeOpenInIBooks];
            }
            
            dispatch_async(dispatch_get_main_queue(), ^{
                rootController.view.userInteractionEnabled = YES;
                [view removeFromSuperview];
                
                UIPasteboard *pasteboard = [UIPasteboard generalPasteboard];
                pasteboard.string = title;
                
                UIAlertController *alert = [UIAlertController alertControllerWithTitle:nil message:@"文字已复制\n分享朋友圈时请粘贴" preferredStyle:UIAlertControllerStyleAlert];
                [alert addAction:[UIAlertAction actionWithTitle:@"确定" style:UIAlertActionStyleDefault handler:^(UIAlertAction * _Nonnull action) {
                    UIActivityViewController *activityVC = [[UIActivityViewController alloc] initWithActivityItems:objectsToShare applicationActivities:excludedArray];
                    
                    activityVC.completionWithItemsHandler = ^(NSString *activityType, BOOL completed, NSArray *returnedItems, NSError *activityError) {
                        if (completed){
                            //NSLog(@"The Activity: %@ was completed", activityType);
                            callback(@[activityType]);
                        }else{
                            //NSLog(@"The Activity: %@ was NOT completed", activityType);
                            callback(@[@"fail"]);
                        }
                        
                    };
                    
                    [rootController presentViewController:activityVC animated:YES completion:nil];
                }]];
                
                [rootController presentViewController:alert animated:YES completion:nil];
            });
        });
    });
}

@end
