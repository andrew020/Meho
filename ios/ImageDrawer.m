//
//  ImageDrawer.m
//  Meho
//
//  Created by 李宗良 on 2018/4/24.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import "ImageDrawer.h"
#import "SDWebImageDownloader.h"
@implementation ImageDrawer

+ (UIColor *)colorFromHexString:(NSString *)hexString {
  unsigned rgbValue = 0;
  NSScanner *scanner = [NSScanner scannerWithString:hexString];
  [scanner setScanLocation:1]; // bypass '#' character
  [scanner scanHexInt:&rgbValue];
  return [UIColor colorWithRed:((rgbValue & 0xFF0000) >> 16)/255.0 green:((rgbValue & 0xFF00) >> 8)/255.0 blue:(rgbValue & 0xFF)/255.0 alpha:1.0];
}

// To export a module named CalendarManager
RCT_EXPORT_MODULE();

// This would name the module AwesomeCalendarManager instead
// RCT_EXPORT_MODULE(AwesomeCalendarManager);

RCT_EXPORT_METHOD(
                  drawGoods:(NSArray *)imagesInfo
                  title:(NSString *)title
                  price:(NSString *)price
                  templateInfo:(NSDictionary *)templateInfo
                  QRCodeURL:(NSString *)QRCodeURL
                  avatar:(NSString *)avatar
                  response:(RCTResponseSenderBlock)response
                  )
{
  NSMutableArray *newGoodsInfo = [imagesInfo mutableCopy];
  for (NSInteger index = 0; index < imagesInfo.count; index++) {
    NSMutableDictionary *item = [imagesInfo[index] mutableCopy];
    NSString *imageBase64 = [self getImageBase64FromBaseImage:item[@"imageString"] QRCodeURL:QRCodeURL avatar:avatar title:title price:price templateInfo:templateInfo];
    [item setObject:[NSString stringWithFormat:@"data:image/png;base64,%@", imageBase64] forKey:@"imageBase64"];
    [newGoodsInfo setObject:item atIndexedSubscript:index];
  }
  response(@[[NSNull null], newGoodsInfo]);
}

- (NSString *)getImageBase64FromBaseImage:(NSString *)goodsImageString QRCodeURL:(NSString *)QRCodeURLString avatar:(NSString *)avatar title:(NSString *)title price:(NSString *)price templateInfo:(NSDictionary *)templateInfo {
  //     "id": "1",
  //     "template_name": "tmp_001",
  //     "background_color": "",
  //     "background_color_xy": "",
  //     "goods_image_xy": "20,20,340,358",
  //     "background_image": "https://demo1.hixiaoqi.cn/uploads/template/tmp_001/bg-01.png",
  //     "background_image_xy": "0,0,375,497",
  //     "code_xy": "25,398,66,66",
  //     "tag_image": "",
  //     "tag_image_xy": "",
  //     "goods_title_align": "right",
  //     "goods_title_color": "#000",
  //     "goods_title_fontSize": "15",
  //     "goods_title_xy": "355,418",.
  //     "goods_price_align": "right",
  //     "goods_price_color": "#000",
  //     "goods_price_fontSize": "18",
  //     "goods_price_xy": "355,460",
  //     "create_time": null
  
  NSString *queueID = @"com.meho.download_image";
  queueID = [queueID stringByAppendingString:[NSUUID UUID].UUIDString];
  dispatch_queue_t queue =  dispatch_queue_create([queueID UTF8String], DISPATCH_QUEUE_CONCURRENT);
  dispatch_group_t group = dispatch_group_create();
  
  __block UIImage *goodsImage = nil;
  __block UIImage *backgroundImage = nil;
  __block UIImage *tagImage = nil;
  __block UIImage *QRCodeImage = nil;
  __block UIImage *avatarImage = nil;
  CGFloat scale = 1;
  
  NSString *backgroundInfo = templateInfo[@"background_image_xy"];
  NSArray *backgroundPoints = [backgroundInfo componentsSeparatedByString:@","];
  NSString *backgroundImageString = templateInfo[@"background_image"];
  NSURL *backgroundImageURL = backgroundImageString ? [[NSURL alloc] initWithString:backgroundImageString] : nil;
  if (backgroundImageURL) {
    dispatch_group_enter(group);
    dispatch_async(queue, ^{
      [SDWebImageDownloader.sharedDownloader downloadImageWithURL:backgroundImageURL options:SDWebImageDownloaderUseNSURLCache progress:nil completed:^(UIImage * _Nullable image, NSData * _Nullable data, NSError * _Nullable error, BOOL finished) {
        backgroundImage = image;
        dispatch_group_leave(group);
      }];
    });
  }
  
  NSURL *goodsURL = goodsImageString ? [[NSURL alloc] initWithString:goodsImageString] : nil;
  NSString *imageInfo = templateInfo[@"goods_image_xy"];
  NSArray *imagePoints = [imageInfo componentsSeparatedByString:@","];
  if (goodsURL) {
    dispatch_group_enter(group);
    dispatch_async(queue, ^{
      [SDWebImageDownloader.sharedDownloader downloadImageWithURL:goodsURL options:SDWebImageDownloaderUseNSURLCache progress:nil completed:^(UIImage * _Nullable image, NSData * _Nullable data, NSError * _Nullable error, BOOL finished) {
        goodsImage = image;
        dispatch_group_leave(group);
      }];
    });
  }
  
  NSString *tagImageString = templateInfo[@"tag_image"];
  NSURL *tagImageURL = tagImageString ? [[NSURL alloc] initWithString:tagImageString] : nil;
  NSString *tagImageInfo = templateInfo[@"tag_image_xy"];
  NSArray *tagImagePoints = [tagImageInfo componentsSeparatedByString:@","];
  if (tagImageURL) {
    dispatch_group_enter(group);
    dispatch_async(queue, ^{
      [SDWebImageDownloader.sharedDownloader downloadImageWithURL:tagImageURL options:SDWebImageDownloaderUseNSURLCache progress:nil completed:^(UIImage * _Nullable image, NSData * _Nullable data, NSError * _Nullable error, BOOL finished) {
        tagImage = image;
        dispatch_group_leave(group);
      }];
    });
  }
  
  NSURL *QRCodeURL = QRCodeURLString ? [[NSURL alloc] initWithString:QRCodeURLString] : nil;
  NSString *codeInfo = templateInfo[@"code_xy"];
  NSArray *codePoints = [codeInfo componentsSeparatedByString:@","];
  if (QRCodeURL) {
    dispatch_group_enter(group);
    dispatch_async(queue, ^{
      [SDWebImageDownloader.sharedDownloader downloadImageWithURL:QRCodeURL options:SDWebImageDownloaderUseNSURLCache progress:nil completed:^(UIImage * _Nullable image, NSData * _Nullable data, NSError * _Nullable error, BOOL finished) {
        QRCodeImage = image;
        dispatch_group_leave(group);
      }];
    });
  }
  
  NSURL *avatarURL = avatar ? [[NSURL alloc] initWithString:avatar] : nil;
  if (avatarURL) {
    dispatch_group_enter(group);
    dispatch_async(queue, ^{
      [SDWebImageDownloader.sharedDownloader downloadImageWithURL:avatarURL options:SDWebImageDownloaderUseNSURLCache progress:nil completed:^(UIImage * _Nullable image, NSData * _Nullable data, NSError * _Nullable error, BOOL finished) {
        avatarImage = image;
        dispatch_group_leave(group);
      }];
    });
  }
  
  dispatch_group_wait(group, dispatch_time(DISPATCH_TIME_NOW, 120 * NSEC_PER_SEC));
  
  if (avatarImage) {
    UIGraphicsBeginImageContext(avatarImage.size);
    CGContextRef ctx = UIGraphicsGetCurrentContext();
    CGRect rect = CGRectMake(0, 0, avatarImage.size.width, avatarImage.size.height);
    CGPathRef clippath = [UIBezierPath bezierPathWithRoundedRect:rect cornerRadius:avatarImage.size.width / 2].CGPath;
    CGContextAddPath(ctx, clippath);
    CGContextClip(ctx);
    [avatarImage drawInRect:rect];
    avatarImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
  }
  
  if (backgroundImage) {
    scale = backgroundImage.size.width / [backgroundPoints[2] floatValue];
  }
  UIGraphicsBeginImageContext(
                              CGSizeMake(
                                         [backgroundPoints[0] floatValue] * scale + [backgroundPoints[2] floatValue] * scale ,
                                         [backgroundPoints[1] floatValue] * scale  + [backgroundPoints[3] floatValue] * scale
                                         )
                              );
  if (backgroundImage) {
    CGRect rect = CGRectMake([backgroundPoints[0] floatValue] * scale , [backgroundPoints[1] floatValue] * scale , [backgroundPoints[2] floatValue] * scale , [backgroundPoints[3] floatValue] * scale );
    [backgroundImage drawInRect:rect];
  }
  if (goodsImage) {
    CGSize imageSize = goodsImage.size;
    CGFloat areaScale = [imagePoints[2] floatValue] / [imagePoints[3] floatValue];
    CGFloat imageScale = imageSize.width / imageSize.height;
    if (imageScale > areaScale) {
      CGFloat resizeWidth = imageSize.height * areaScale;
      CGRect rect = CGRectMake((imageSize.width - resizeWidth) / 2., 0, resizeWidth, imageSize.height);
      CGImageRef newImageRef = CGImageCreateWithImageInRect(goodsImage.CGImage, rect);
      goodsImage = [UIImage imageWithCGImage:newImageRef];
    }
    else if (imageScale < areaScale) {
      CGFloat resizeHeight = imageSize.width / areaScale;
      CGRect rect = CGRectMake(0, (imageSize.height - resizeHeight) / 2., imageSize.width, resizeHeight);
      CGImageRef newImageRef = CGImageCreateWithImageInRect(goodsImage.CGImage, rect);
      goodsImage = [UIImage imageWithCGImage:newImageRef];
    }
    
    if ([imagePoints[2] floatValue] / imageSize.width > [imagePoints[3] floatValue] / imageSize.height) {
      
    }
    else {
      
    }
    
    CGRect rect = CGRectMake([imagePoints[0] floatValue] * scale , [imagePoints[1] floatValue] * scale , [imagePoints[2] floatValue] * scale , [imagePoints[3] floatValue] * scale );
    [goodsImage drawInRect:rect];
  }
  if (tagImage) {
    CGRect rect = CGRectMake([tagImagePoints[0] floatValue] * scale , [tagImagePoints[1] floatValue] * scale , [tagImagePoints[2] floatValue] * scale , [tagImagePoints[3] floatValue] * scale );
    [tagImage drawInRect:rect];
  }
  if (QRCodeImage) {
    CGRect rect = CGRectMake([codePoints[0] floatValue] * scale , [codePoints[1] floatValue] * scale , [codePoints[2] floatValue] * scale , [codePoints[3] floatValue] * scale );
    [QRCodeImage drawInRect:rect];
  }
  if (avatarImage) {
    CGRect rect = CGRectMake(([codePoints[0] floatValue] + 17.5) * scale , ([codePoints[1] floatValue]  + 17.5) * scale , ([codePoints[2] floatValue] - 35) * scale , ([codePoints[3] floatValue] - 35) * scale );
    [avatarImage drawInRect:rect];
  }
  
  if (title) {
    NSString *goods_title_align = templateInfo[@"goods_title_align"];
    NSString *goods_title_color = templateInfo[@"goods_title_color"];
    NSString *goods_title_fontSize = templateInfo[@"goods_title_fontSize"];
    NSString *goods_title_xy = templateInfo[@"goods_title_xy"];
    NSArray *goods_title_points = [goods_title_xy componentsSeparatedByString:@","];
    
    NSDictionary *attri = @{
                            NSForegroundColorAttributeName: [ImageDrawer colorFromHexString:goods_title_color],
                            NSFontAttributeName: [UIFont systemFontOfSize:[goods_title_fontSize floatValue] * scale ],
                            };
    CGFloat x = [goods_title_points[0] floatValue] * scale ;
    CGSize size = [title sizeWithAttributes:attri];
    if ([goods_title_align isEqualToString:@"right"]) {
      x -= size.width;
    }
    else if ([goods_title_align isEqualToString:@"center"]) {
      x -= size.width / 2;
    }
    [title drawAtPoint:CGPointMake(x, [goods_title_points[1] floatValue] * scale  - size.height)
        withAttributes:attri];
  }
  
  if (price) {
    NSString *goods_price_align = templateInfo[@"goods_price_align"];
    NSString *goods_price_color = templateInfo[@"goods_price_color"];
    NSString *goods_price_fontSize = templateInfo[@"goods_price_fontSize"];
    NSString *goods_price_xy = templateInfo[@"goods_price_xy"];
    NSArray *goods_price_points = [goods_price_xy componentsSeparatedByString:@","];
    
    NSDictionary *attri = @{
                            NSForegroundColorAttributeName: [ImageDrawer colorFromHexString:goods_price_color],
                            NSFontAttributeName: [UIFont systemFontOfSize:[goods_price_fontSize floatValue] * scale ],
                            };
    
    CGFloat x = [goods_price_points[0] floatValue] * scale ;
    CGSize size = [price sizeWithAttributes:attri];
    if ([goods_price_align isEqualToString:@"right"]) {
      x -= size.width;
    }
    else if ([goods_price_align isEqualToString:@"center"]) {
      x -= size.width / 2;
    }
    [price drawAtPoint:CGPointMake(x, [goods_price_points[1] floatValue] * scale  - size.height)
        withAttributes:attri];
  }
  
  UIImage *newImage = UIGraphicsGetImageFromCurrentImageContext();
  UIGraphicsEndImageContext();
  
  NSData *imageData = UIImagePNGRepresentation(newImage);
  NSString *imageString = [imageData base64EncodedStringWithOptions:NSDataBase64Encoding64CharacterLineLength];
  return imageString;
}

@end
